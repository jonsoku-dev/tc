import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { PlusCircle, Book, Edit, Trash, Search, Filter, SortDesc } from "lucide-react";
import { Link } from "react-router";
import { Input } from "~/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EbookCover } from "../components/ebook-cover";
import type { Route } from "./+types/ebooks-page.page";

export function loader({ request }: Route.LoaderArgs) {
  // 실제 구현에서는 Supabase에서 전자책 목록을 가져옵니다.
  return {
    ebooks: [
      {
        ebook_id: "1",
        title: "마크다운으로 배우는 프로그래밍",
        description: "마크다운을 활용한 프로그래밍 학습 가이드",
        ebook_status: "published",
        price: "15000",
        cover_image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
        publication_date: "2023-05-15T00:00:00Z",
        reading_time: 180,
        page_count: 250,
        language: "ko",
        is_featured: true,
      },
      {
        ebook_id: "2",
        title: "리액트 기초부터 고급까지",
        description: "리액트 개발의 모든 것",
        ebook_status: "draft",
        price: "20000",
        cover_image_url: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
        publication_date: null,
        reading_time: 240,
        page_count: 320,
        language: "ko",
        is_featured: false,
      },
      {
        ebook_id: "3",
        title: "타입스크립트 마스터하기",
        description: "타입스크립트 심화 학습",
        ebook_status: "archived",
        price: "18000",
        cover_image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
        publication_date: "2022-11-20T00:00:00Z",
        reading_time: 150,
        page_count: 200,
        language: "ko",
        is_featured: false,
      },
    ],
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "전자책 목록" },
    { name: "description", content: "내 전자책 목록을 관리하세요" },
  ];
}

export default function EbooksPage({ loaderData }: Route.ComponentProps) {
  const { ebooks } = loaderData;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);

  const statusColors = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-800",
  };

  // 필터링 및 정렬 로직
  const filteredEbooks = ebooks
    .filter((ebook) => {
      // 검색어 필터링
      if (searchTerm && !ebook.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 상태 필터링
      if (statusFilter !== "all" && ebook.ebook_status !== statusFilter) {
        return false;
      }

      // 언어 필터링
      if (languageFilter !== "all" && ebook.language !== languageFilter) {
        return false;
      }

      // 추천 필터링
      if (featuredOnly && !ebook.is_featured) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 정렬 로직
      switch (sortBy) {
        case "newest":
          return new Date(b.publication_date || 0).getTime() - new Date(a.publication_date || 0).getTime();
        case "oldest":
          return new Date(a.publication_date || 0).getTime() - new Date(b.publication_date || 0).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "price_high":
          return Number(b.price) - Number(a.price);
        case "price_low":
          return Number(a.price) - Number(b.price);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 전자책</h1>
        <Button asChild>
          <Link to="/ebooks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            새 전자책 만들기
          </Link>
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="전자책 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="상태 필터" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="published">출판됨</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="archived">보관됨</SelectItem>
            </SelectContent>
          </Select>

          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="언어 필터" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 언어</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="en">영어</SelectItem>
              <SelectItem value="ja">일본어</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <div className="flex items-center">
                <SortDesc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="정렬 기준" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
              <SelectItem value="title">제목순</SelectItem>
              <SelectItem value="price_high">가격 높은순</SelectItem>
              <SelectItem value="price_low">가격 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="featured-only"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="featured-only" className="text-sm">추천 eBook만 보기</label>
        </div>
      </div>

      {filteredEbooks.length === 0 ? (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium">전자책이 없습니다</h2>
          <p className="mt-2 text-gray-500">검색 조건에 맞는 전자책이 없거나, 새 전자책을 만들어 시작하세요.</p>
          <Button className="mt-4" asChild>
            <Link to="/ebooks/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              새 전자책 만들기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEbooks.map((ebook) => (
            <Card key={ebook.ebook_id} className="overflow-hidden flex flex-col">
              <div className="relative h-48">
                <Link to={`/ebooks/${ebook.ebook_id}`}>
                  <EbookCover
                    imageUrl={ebook.cover_image_url}
                    alt={ebook.title}
                    className="w-full h-full"
                  />
                </Link>
                {ebook.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-purple-500">추천</Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      <Link to={`/ebooks/${ebook.ebook_id}`} className="hover:underline">
                        {ebook.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 h-10">
                      {ebook.description}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[ebook.ebook_status as keyof typeof statusColors]}>
                    {ebook.ebook_status === "published" ? "출판됨" :
                      ebook.ebook_status === "draft" ? "초안" : "보관됨"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <p className="font-medium">가격: {Number(ebook.price).toLocaleString()}원</p>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  {ebook.publication_date && (
                    <p>출판일: {format(new Date(ebook.publication_date), "yyyy년 MM월 dd일", { locale: ko })}</p>
                  )}
                  {ebook.page_count && (
                    <p>페이지: {ebook.page_count}쪽</p>
                  )}
                  {ebook.reading_time && (
                    <p>읽기 시간: 약 {Math.floor(ebook.reading_time / 60)}시간 {ebook.reading_time % 60}분</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" asChild>
                  <Link to={`/ebooks/${ebook.ebook_id}`}>
                    <Book className="mr-2 h-4 w-4" />
                    보기
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/ebooks/${ebook.ebook_id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="text-red-500">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
