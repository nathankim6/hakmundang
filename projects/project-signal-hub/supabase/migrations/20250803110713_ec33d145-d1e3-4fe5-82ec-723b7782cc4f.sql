-- header_settings 테이블의 중복 레코드를 정리하고 단일 레코드만 유지
-- 가장 최근 업데이트된 레코드를 제외하고 모든 레코드 삭제
DELETE FROM header_settings 
WHERE id NOT IN (
    SELECT id 
    FROM header_settings 
    ORDER BY updated_at DESC 
    LIMIT 1
);

-- 향후 중복을 방지하기 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION ensure_single_header_setting()
RETURNS TRIGGER AS $$
BEGIN
    -- header_settings 테이블에 레코드가 이미 있는지 확인
    IF EXISTS (SELECT 1 FROM header_settings) THEN
        -- 기존 레코드를 업데이트
        UPDATE header_settings 
        SET 
            logo_url = NEW.logo_url,
            title = NEW.title,
            subtitle = NEW.subtitle,
            updated_at = NEW.updated_at
        WHERE id = (SELECT id FROM header_settings ORDER BY updated_at DESC LIMIT 1);
        
        -- 새 INSERT를 취소
        RETURN NULL;
    ELSE
        -- 첫 번째 레코드는 허용
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE OR REPLACE TRIGGER ensure_single_header_setting_trigger
    BEFORE INSERT ON header_settings
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_header_setting();