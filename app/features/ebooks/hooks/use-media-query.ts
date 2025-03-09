import { useEffect, useState } from "react";

/**
 * 미디어 쿼리를 감지하는 훅
 * @param query 미디어 쿼리 문자열 (예: "(max-width: 768px)")
 * @returns 미디어 쿼리 일치 여부
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // 서버 사이드 렌더링 환경에서는 window가 없으므로 체크
        if (typeof window !== "undefined") {
            const media = window.matchMedia(query);

            // 초기 상태 설정
            setMatches(media.matches);

            // 변경 이벤트 리스너 등록
            const listener = (event: MediaQueryListEvent) => {
                setMatches(event.matches);
            };

            // 이벤트 리스너 추가
            media.addEventListener("change", listener);

            // 클린업 함수
            return () => {
                media.removeEventListener("change", listener);
            };
        }

        // 기본값은 false
        return () => { };
    }, [query]);

    return matches;
} 