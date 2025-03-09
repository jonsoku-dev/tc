import type { MetaFunction } from "react-router";

export namespace Route {
    export interface LoaderArgs {
        params: Record<string, string>;
        request: Request;
    }

    export interface ActionArgs {
        params: Record<string, string>;
        request: Request;
    }

    export interface MetaArgs {
        params: Record<string, string>;
        data: any;
    }

    export interface ComponentProps {
        loaderData?: any;
        actionData?: any;
    }
} 