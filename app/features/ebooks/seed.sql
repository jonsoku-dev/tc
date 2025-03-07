-- ebooks 테이블 시드 데이터
INSERT INTO ebooks (ebook_id, user_id, title, description, ebook_status, price, cover_image_url, sample_content, page_count, language, publication_date, isbn, is_featured, reading_time)
VALUES 
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', '프로그래밍의 기초', '프로그래밍을 처음 시작하는 사람들을 위한 가이드', 'published', 15000, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80', '이 책은 프로그래밍의 기본 개념을 다룹니다...', 120, 'ko', '2023-01-15 00:00:00', '978-1234567890', true, 240),
  
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', '웹 개발 마스터하기', '현대 웹 개발 기술을 배우는 종합 가이드', 'published', 25000, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', '웹 개발의 세계에 오신 것을 환영합니다...', 250, 'ko', '2023-03-20 00:00:00', '978-0987654321', true, 500),
  
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', '데이터 과학 입문', '데이터 분석과 머신러닝의 기초', 'draft', 20000, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80', '데이터 과학의 기본 개념과 도구를 소개합니다...', 180, 'ko', NULL, '978-5678901234', false, 360);

-- ebook_pages 테이블 시드 데이터 (레거시 방식)
INSERT INTO ebook_pages (page_id, ebook_id, page_number, position, title, content_type, content)
VALUES
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 1, 1, '프로그래밍이란 무엇인가?', 'text', '{"content": "프로그래밍은 컴퓨터에게 특정 작업을 수행하도록 지시하는 과정입니다. 이는 마치 요리 레시피를 작성하는 것과 유사합니다. 정확한 단계와 재료(데이터)를 지정하여 원하는 결과물을 얻을 수 있습니다.", "style": {"fontSize": "16px", "lineHeight": "1.6"}}'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 2, 2, '첫 번째 프로그램 작성하기', 'mixed', '{"blocks": [{"type": "text", "content": "프로그래밍 언어를 사용하여 첫 번째 프로그램을 작성해 봅시다. 가장 기본적인 예제는 \"Hello, World!\"를 출력하는 프로그램입니다."}, {"type": "code", "language": "python", "code": "print(\"Hello, World!\")"}]}'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 3, 3, '프로그래밍 언어의 종류', 'image', '{"url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", "alt": "다양한 프로그래밍 언어", "caption": "현대 소프트웨어 개발에 사용되는 다양한 프로그래밍 언어들", "width": 1170, "height": 780}');

-- ebook_pages 테이블 시드 데이터 (블록 기반 방식)
INSERT INTO ebook_pages (page_id, ebook_id, page_number, position, title, blocks)
VALUES
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 1, 1, 'HTML 소개', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "HTML 소개",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "HTML은 웹 페이지의 구조를 정의하는 마크업 언어입니다. 웹 페이지의 기본 골격을 형성하며, 텍스트, 이미지, 링크 등의 요소를 배치하는 방법을 지정합니다.",
        "style": {"fontSize": "16px", "lineHeight": "1.6"},
        "position": 2
      },
      {
        "id": "block-3",
        "type": "markdown",
        "content": "## HTML의 주요 특징\n\n- **구조화된 문서**: HTML은 웹 페이지의 구조를 정의합니다.\n- **태그 기반**: HTML은 태그를 사용하여 요소를 정의합니다.\n- **계층적 구조**: HTML 문서는 계층적 구조를 가집니다.",
        "position": 3
      }
   ]'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 2, 2, 'HTML 기본 구조', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "HTML 기본 구조",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "모든 HTML 문서는 기본적인 구조를 가지고 있습니다. 이 구조는 문서 타입 선언, html, head, body 요소로 구성됩니다.",
        "position": 2
      },
      {
        "id": "block-3",
        "type": "code",
        "language": "html",
        "code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>제목</title>\n</head>\n<body>\n  <h1>안녕하세요!</h1>\n</body>\n</html>",
        "caption": "기본 HTML 문서 구조",
        "position": 3
      }
   ]'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 3, 3, '반응형 웹 디자인', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "반응형 웹 디자인",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "반응형 웹 디자인은 다양한 화면 크기와 장치에 맞게 웹 페이지가 자동으로 조정되는 디자인 방식입니다.",
        "position": 2
      },
      {
        "id": "block-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80",
        "alt": "반응형 웹 디자인",
        "caption": "다양한 디바이스에서 최적화된 사용자 경험을 제공하는 반응형 웹 디자인",
        "width": 1064,
        "height": 700,
        "position": 3
      },
      {
        "id": "block-4",
        "type": "markdown",
        "content": "## 반응형 웹 디자인의 장점\n\n1. **모바일 친화적**: 모바일 장치에서도 최적의 사용자 경험을 제공합니다.\n2. **유지보수 용이성**: 하나의 코드베이스로 여러 장치를 지원할 수 있습니다.\n3. **SEO 향상**: 검색 엔진 최적화에 도움이 됩니다.",
        "position": 4
      }
   ]'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '데이터 과학 입문' ORDER BY created_at DESC LIMIT 1), 1, 1, '데이터 과학 개요', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "데이터 과학 개요",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "데이터 과학은 데이터로부터 가치 있는 통찰력을 얻는 분야입니다. 이는 통계학, 컴퓨터 과학, 도메인 지식을 결합하여 데이터에서 의미 있는 패턴을 발견하고 의사 결정에 활용합니다.",
        "style": {"fontSize": "16px", "lineHeight": "1.6"},
        "position": 2
      },
      {
        "id": "block-3",
        "type": "markdown",
        "content": "## 데이터 과학의 주요 구성 요소\n\n- **데이터 수집**: 다양한 소스에서 데이터를 수집합니다.\n- **데이터 전처리**: 수집된 데이터를 분석에 적합한 형태로 변환합니다.\n- **데이터 분석**: 통계적 방법과 머신러닝 알고리즘을 사용하여 데이터를 분석합니다.\n- **데이터 시각화**: 분석 결과를 시각적으로 표현하여 이해하기 쉽게 만듭니다.\n- **의사 결정**: 분석 결과를 바탕으로 의사 결정을 내립니다.",
        "position": 3
      }
   ]'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '데이터 과학 입문' ORDER BY created_at DESC LIMIT 1), 2, 2, '데이터 시각화 예제', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "데이터 시각화 예제",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "데이터 시각화는 복잡한 데이터를 그래프, 차트, 다이어그램 등의 시각적 요소로 표현하는 과정입니다. 이를 통해 데이터의 패턴, 추세, 이상치 등을 쉽게 파악할 수 있습니다.",
        "position": 2
      },
      {
        "id": "block-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "alt": "데이터 시각화 예제",
        "caption": "데이터 시각화 차트",
        "width": 1170,
        "height": 780,
        "position": 3
      },
      {
        "id": "block-4",
        "type": "code",
        "language": "python",
        "code": "import matplotlib.pyplot as plt\nimport numpy as np\n\n# 데이터 생성\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\n# 그래프 그리기\nplt.figure(figsize=(10, 6))\nplt.plot(x, y, \'b-\', linewidth=2)\nplt.title(\'Sine Wave\')\nplt.xlabel(\'x\')\nplt.ylabel(\'sin(x)\')\nplt.grid(True)\nplt.show()",
        "caption": "Python을 사용한 사인 파동 그래프 생성 코드",
        "position": 4
      }
   ]'),
  
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '데이터 과학 입문' ORDER BY created_at DESC LIMIT 1), 3, 3, '머신러닝 기초', 
   '[
      {
        "id": "block-1",
        "type": "heading",
        "content": "머신러닝 기초",
        "level": 1,
        "position": 1
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": "머신러닝은 컴퓨터가 데이터로부터 학습하여 예측이나 결정을 내릴 수 있게 하는 기술입니다. 이는 인공지능의 한 분야로, 명시적인 프로그래밍 없이도 컴퓨터가 학습할 수 있게 합니다.",
        "position": 2
      },
      {
        "id": "block-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1965&q=80",
        "alt": "머신러닝 개념",
        "caption": "머신러닝 알고리즘의 학습 과정",
        "width": 1965,
        "height": 1310,
        "position": 3
      },
      {
        "id": "block-4",
        "type": "markdown",
        "content": "## 머신러닝의 주요 유형\n\n### 지도 학습 (Supervised Learning)\n- 레이블이 있는 데이터를 사용하여 모델을 훈련시킵니다.\n- 예: 분류, 회귀\n\n### 비지도 학습 (Unsupervised Learning)\n- 레이블이 없는 데이터에서 패턴을 찾습니다.\n- 예: 클러스터링, 차원 축소\n\n### 강화 학습 (Reinforcement Learning)\n- 환경과 상호작용하며 보상을 최대화하는 방향으로 학습합니다.\n- 예: 게임 플레이, 로봇 제어",
        "position": 4
      },
      {
        "id": "block-5",
        "type": "table",
        "headers": ["알고리즘", "유형", "주요 용도"],
        "rows": [
          ["선형 회귀", "지도 학습", "연속적인 값 예측"],
          ["로지스틱 회귀", "지도 학습", "이진 분류"],
          ["결정 트리", "지도 학습", "분류 및 회귀"],
          ["K-평균", "비지도 학습", "클러스터링"],
          ["주성분 분석(PCA)", "비지도 학습", "차원 축소"],
          ["Q-러닝", "강화 학습", "순차적 의사 결정"]
        ],
        "caption": "주요 머신러닝 알고리즘 비교",
        "position": 5
      }
   ]');

-- categories 테이블 시드 데이터
INSERT INTO categories (category_id, name)
VALUES
  (uuid_generate_v4(), '프로그래밍'),
  (uuid_generate_v4(), '웹 개발'),
  (uuid_generate_v4(), '데이터 과학');

-- collaborators 테이블 시드 데이터
INSERT INTO collaborators (collaborator_id, ebook_id, user_id, permission)
VALUES
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', 'edit'),
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '데이터 과학 입문' ORDER BY created_at DESC LIMIT 1), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', 'view');

-- ebook_versions 테이블 시드 데이터
INSERT INTO ebook_versions (version_id, ebook_id, version_number, content_markdown)
VALUES
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 1, '# 프로그래밍의 기초\n\n## 1장: 프로그래밍 소개\n프로그래밍은 컴퓨터에게 특정 작업을 수행하도록 지시하는 과정입니다...'),
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 2, '# 프로그래밍의 기초 (개정판)\n\n## 1장: 프로그래밍 소개\n프로그래밍은 컴퓨터에게 특정 작업을 수행하도록 지시하는 과정입니다...\n\n### 추가된 내용\n프로그래밍 언어의 종류와 특징');

-- reading_progress 테이블 시드 데이터
INSERT INTO reading_progress (progress_id, user_id, ebook_id, current_page, progress_percentage, last_read_at, is_completed)
VALUES
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 50, 41.67, '2023-05-10 15:30:00', false),
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 250, 100, '2023-06-20 10:15:00', true);

-- reviews 테이블 시드 데이터
INSERT INTO reviews (review_id, ebook_id, user_id, rating, comment)
VALUES
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', 5, '초보자에게 매우 유용한 책입니다. 개념 설명이 명확하고 예제가 풍부합니다.'),
  (uuid_generate_v4(), (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', 4, '웹 개발에 대한 좋은 입문서입니다. 다만 일부 최신 기술에 대한 내용이 부족합니다.');

-- bookmarks 테이블 시드 데이터
INSERT INTO bookmarks (bookmark_id, user_id, ebook_id, page_number, title)
VALUES
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 25, '변수 선언 방법'),
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 75, 'CSS 선택자 사용법');

-- highlights 테이블 시드 데이터
INSERT INTO highlights (highlight_id, user_id, ebook_id, page_number, start_position, end_position, text, color, note)
VALUES
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '프로그래밍의 기초' ORDER BY created_at DESC LIMIT 1), 30, 150, 250, '프로그래밍 언어는 컴퓨터와 소통하기 위한 형식적인 언어입니다.', 'yellow', '프로그래밍 언어의 정의'),
  (uuid_generate_v4(), '763ffa1a-1ce6-49d6-9ba5-2bcc8f2d39be', (SELECT ebook_id FROM ebooks WHERE title = '웹 개발 마스터하기' ORDER BY created_at DESC LIMIT 1), 100, 300, 450, 'CSS는 웹 페이지의 스타일과 레이아웃을 정의하는 스타일시트 언어입니다.', 'green', 'CSS의 정의와 역할');
