import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";

/**
 * JSON 문자열을 파싱하려고 시도합니다. 실패하면 원래 값을 반환합니다.
 */
const tryParseJSON = (value: string | File | Blob) => {
    if (value instanceof File || value instanceof Blob) {
        return value;
    }
    try {
        const json = JSON.parse(value);
        return json;
    } catch (e) {
        return value;
    }
};

/**
 * 폼 데이터에서 구조화된 객체를 생성합니다.
 * 키에 포함된 정수 인덱스는 배열로 처리됩니다.
 */
export const generateFormData = (
    formData: FormData | URLSearchParams,
    preserveStringified = false,
) => {
    // 빈 출력 객체 초기화
    const outputObject: Record<string, any> = {};

    // 폼 데이터의 각 키-값 쌍을 반복
    for (const [key, value] of formData.entries()) {
        // 원래 타입으로 데이터 변환 시도, 실패하면 원래 값 반환
        const data = preserveStringified ? value : tryParseJSON(value);
        // 키를 부분으로 분할
        const keyParts = key.split(".");
        // 출력 객체의 현재 객체를 가리키는 변수 초기화
        let currentObject = outputObject;

        // 마지막을 제외한 각 키 부분을 반복
        for (let i = 0; i < keyParts.length - 1; i++) {
            // 현재 키 부분 가져오기
            const keyPart = keyParts[i];
            // 현재 객체에 현재 키 부분의 속성이 없는 경우,
            // 다음 키 부분이 유효한 정수 인덱스인지 여부에 따라 객체 또는 배열로 초기화
            if (!currentObject[keyPart]) {
                currentObject[keyPart] = /^\d+$/.test(keyParts[i + 1]) ? [] : {};
            }
            // 현재 객체 포인터를 출력 객체의 다음 레벨로 이동
            currentObject = currentObject[keyPart];
        }

        // 마지막 키 부분 가져오기
        const lastKeyPart = keyParts[keyParts.length - 1];
        const lastKeyPartIsArray = /\[\d*\]$|\[\]$/.test(lastKeyPart);

        // array[] 또는 array[0] 케이스 처리
        if (lastKeyPartIsArray) {
            const key = lastKeyPart.replace(/\[\d*\]$|\[\]$/, "");
            if (!currentObject[key]) {
                currentObject[key] = [];
            }

            currentObject[key].push(data);
        }

        // array.foo.0 케이스 처리
        if (!lastKeyPartIsArray) {
            // 마지막 키 부분이 유효한 정수 인덱스인 경우, 현재 배열에 값을 푸시
            if (/^\d+$/.test(lastKeyPart)) {
                currentObject.push(data);
            }
            // 그렇지 않으면 마지막 키 부분과 해당 값으로 현재 객체에 속성 설정
            else {
                currentObject[lastKeyPart] = data;
            }
        }
    }

    // 출력 객체 반환
    return outputObject;
};

/**
 * URL 검색 매개변수에서 폼 데이터를 가져옵니다.
 */
export const getFormDataFromSearchParams = <T extends FieldValues>(
    request: Pick<Request, "url">,
    preserveStringified = false,
): T => {
    const searchParams = new URL(request.url).searchParams;
    return generateFormData(searchParams, preserveStringified) as T;
};

/**
 * 요청이 GET 메서드인지 확인합니다.
 */
export const isGet = (request: Pick<Request, "method">) =>
    request.method === "GET" || request.method === "get";

type ReturnData<T extends FieldValues> =
    | {
        data: T;
        errors: undefined;
        receivedValues: Partial<T>;
    }
    | {
        data: undefined;
        errors: FieldErrors<T>;
        receivedValues: Partial<T>;
    };

/**
 * HTTP 요청에서 데이터를 파싱하고 스키마에 대해 유효성을 검사합니다.
 * 로더와 액션 모두에서 작동하며, 로더에서는 검색 매개변수에서 데이터를 추출하고
 * 액션에서는 요청 formData에서 추출합니다.
 */
export const getValidatedFormData = async <T extends FieldValues>(
    request: Request | FormData,
    resolver: Resolver<T>,
    preserveStringified = false,
): Promise<ReturnData<T>> => {
    const receivedValues =
        request instanceof Request && isGet(request)
            ? getFormDataFromSearchParams<T>(request, preserveStringified)
            : await parseFormData<T>(request, preserveStringified);

    const data = await validateFormData<T>(receivedValues, resolver);

    return { ...data, receivedValues };
};

/**
 * 프론트엔드에서 파싱된 폼 데이터의 유효성을 검사하는 액션에서 사용되는 헬퍼 메서드입니다.
 * 유효성 검사가 실패하면 JSON 오류를 반환합니다.
 */
export const validateFormData = async <T extends FieldValues>(
    data: any,
    resolver: Resolver<T>,
) => {
    const dataToValidate =
        data instanceof FormData ? Object.fromEntries(data) : data;
    const { errors, values } = await resolver(
        dataToValidate,
        {},
        { shouldUseNativeValidation: false, fields: {} },
    );

    if (Object.keys(errors).length > 0) {
        return { errors: errors as FieldErrors<T>, data: undefined };
    }

    return { errors: undefined, data: values as T };
};

/**
 * 지정된 데이터와 키로 FormData의 새 인스턴스를 생성합니다.
 */
export const createFormData = <T extends FieldValues>(
    data: T,
    stringifyAll = true,
): FormData => {
    const formData = new FormData();
    if (!data) {
        return formData;
    }
    for (const [key, value] of Object.entries(data)) {
        // undefined 값 건너뛰기
        if (value === undefined) {
            continue;
        }
        // FileList 처리
        if (typeof FileList !== "undefined" && value instanceof FileList) {
            for (let i = 0; i < value.length; i++) {
                formData.append(key, value[i]);
            }
            continue;
        }
        // File 및 Blob 객체 배열 처리
        if (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => item instanceof File || item instanceof Blob)
        ) {
            for (let i = 0; i < value.length; i++) {
                formData.append(key, value[i]);
            }
            continue;
        }
        // File 또는 Blob 처리
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
            continue;
        }
        // 설정된 경우 모든 값을 문자열화
        if (stringifyAll) {
            formData.append(key, JSON.stringify(value));
            continue;
        }
        // 문자열 처리
        if (typeof value === "string") {
            formData.append(key, value);
            continue;
        }
        // 날짜 처리
        if (value instanceof Date) {
            formData.append(key, value.toISOString());
            continue;
        }
        // 다른 모든 값 처리
        formData.append(key, JSON.stringify(value));
    }

    return formData;
};

/**
 * 지정된 Request 객체의 FormData를 파싱하여 지정된 키와 연결된 데이터를 검색하거나
 * 지정된 FormData를 파싱하여 데이터를 검색합니다.
 */
export const parseFormData = async <T>(
    request: Request | FormData,
    preserveStringified = false,
): Promise<T> => {
    const formData =
        request instanceof Request ? await request.formData() : request;
    return generateFormData(formData, preserveStringified) as T;
}; 