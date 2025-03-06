-- 슬러그 생성 함수
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(title);
  result := regexp_replace(result, '[^a-z0-9\s]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := trim(both '-' from result);
  IF result = '' THEN
    result := 'item-' || substr(md5(random()::text), 1, 6);
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 슬러그 설정 트리거
CREATE OR REPLACE FUNCTION set_ebook_slug() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    IF EXISTS (SELECT 1 FROM ebooks WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ebook_slug
BEFORE INSERT OR UPDATE ON ebooks
FOR EACH ROW EXECUTE FUNCTION set_ebook_slug();