import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { PlusCircle, Book, Edit, Trash } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/ebooks-page.page";

export function loader({ request }: Route.LoaderArgs) {
  // 실제 구현에서는 Supabase에서 전자책 목록을 가져옵니다.
  return {
    ebooks: [
      {
        ebook_id: "1",
        title: "마크다운으로 배우는 프로그래밍",
        description: "마크다운을 활용한 프로그래밍 학습 가이드",
        status: "published",
        price: "15000",
      },
      {
        ebook_id: "2",
        title: "리액트 기초부터 고급까지",
        description: "리액트 개발의 모든 것",
        status: "draft",
        price: "20000",
      },
      {
        ebook_id: "3",
        title: "타입스크립트 마스터하기",
        description: "타입스크립트 심화 학습",
        status: "archived",
        price: "18000",
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

  const statusColors = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-800",
  };

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

      {ebooks.length === 0 ? (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium">전자책이 없습니다</h2>
          <p className="mt-2 text-gray-500">새 전자책을 만들어 시작하세요.</p>
          <Button className="mt-4" asChild>
            <Link to="/ebooks/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              새 전자책 만들기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map((ebook) => (
            <Card key={ebook.ebook_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{ebook.title}</CardTitle>
                  <Badge className={statusColors[ebook.status as keyof typeof statusColors]}>
                    {ebook.status === "published" ? "출판됨" :
                      ebook.status === "draft" ? "초안" : "보관됨"}
                  </Badge>
                </div>
                <CardDescription>{ebook.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">가격: {Number(ebook.price).toLocaleString()}원</p>
              </CardContent>
              <CardFooter className="flex justify-between">
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
