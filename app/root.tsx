import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation
} from "react-router";

import { Settings } from "luxon";
import Navigation from "~/common/components/navigation";
import { Toaster } from "~/common/components/ui/sonner";
import { cn } from "~/lib/utils";
import { getServerClient } from "~/server";
import type { Route } from "./+types/root";
import "./app.css";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, lazy, Suspense } from "react";

// 개발 모드에서만 ReactQueryDevtools를 임포트
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then(mod => ({
    default: mod.ReactQueryDevtools
  })))
  : () => null;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  let unreadAlertCount = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (profile) {
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("alert_status", "UNREAD");

      unreadAlertCount = count || 0;
    }

    return {
      isAuthenticated: !!user,
      unreadAlertCount,
      profile,
    }
  }

  return {
    isAuthenticated: false,
    unreadAlertCount: 0,
    profile: null,
  }
};

// 앱 레이아웃 컴포넌트 분리
interface AppLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  unreadAlertCount: number;
  profile: any;
  isLoading: boolean;
  pathname: string;
}

function AppLayout({ children, isAuthenticated, unreadAlertCount, profile, isLoading, pathname }: AppLayoutProps) {
  const isEbookReader = pathname.includes("/ebooks/") && pathname.includes("/read");

  return (
    <div className={cn({
      "px-20 py-28": !pathname.includes("/auth") && !isEbookReader,
      "opacity-50 transition-opacity duration-300 animate-pulse": isLoading,
      "min-h-screen overflow-auto": isEbookReader,
    })}>
      {isAuthenticated && !isEbookReader && <Navigation unreadAlertCount={unreadAlertCount} profile={profile} />}
      {children}
    </div>
  );
}

export default function Root() {
  const { isAuthenticated, unreadAlertCount, profile } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // React Query 클라이언트 설정
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // 개발 모드에서만 콘솔에 에러 로깅
        if (import.meta.env.DEV) {
          console.error('Query 에러:', error, query);
        }

        // 사용자에게 에러 알림
        toast.error(
          `요청 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        );
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // 개발 모드에서만 콘솔에 에러 로깅
        if (import.meta.env.DEV) {
          console.error('Mutation 에러:', error, mutation);
        }

        // 사용자에게 에러 알림 (이미 처리된 경우 제외)
        if (!mutation.options.onError) {
          toast.error(
            `요청 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          );
        }
      },
    }),
  }));

  // 기본 설정
  Settings.defaultLocale = "ko";
  Settings.defaultZone = "Asia/Tokyo";

  return (
    <html lang="ko" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <QueryClientProvider client={queryClient}>
          <main className="min-h-full">
            <AppLayout
              isAuthenticated={isAuthenticated}
              unreadAlertCount={unreadAlertCount}
              profile={profile}
              isLoading={isLoading}
              pathname={pathname}
            >
              <Outlet />
            </AppLayout>
            <Toaster />
          </main>
          {/* 개발 모드에서만 React Query Devtools 표시 */}
          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          )}
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <html lang="ko" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main className="container mx-auto p-4 pt-16">
          <h1>{message}</h1>
          <p>{details}</p>
          {stack && (
            <pre className="w-full overflow-x-auto p-4">
              <code>{stack}</code>
            </pre>
          )}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
