"server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import { z } from "zod";

interface OpenAIRequest {
  model: string;
  input: string | ResponseInput;
  temperature: number;
  max_completion_tokens: number;
}

interface OpenAIStructuredRequest<T extends z.ZodType> extends OpenAIRequest {
  responseSchema: T;
  schemaName: string;
}

export async function callOpenAI(request: OpenAIRequest): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.log(process.env.NEXT_PUBLIC_APP_ENV);
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log(`OpenAI SDK 호출: 모델 ${request.model}`);
    console.log("요청 정보:", {
      model: request.model,
      messageCount: request.input.length,
      temperature: request.temperature,
      max_completion_tokens: request.max_completion_tokens,
    });

    const completion = await openai.responses.create({
      model: request.model,
      input: request.input,
      temperature: request.temperature,
      max_output_tokens: request.max_completion_tokens,
    });

    const content = completion.output_text;

    if (!content || content.length < 20) {
      throw new Error(
        "AI가 충분한 내용을 생성하지 못했습니다. 다시 시도해 주세요.",
      );
    }

    return content;
  } catch (error: any) {
    console.error("OpenAI SDK 호출 오류:", error);

    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API 오류: ${error.status} - ${error.message}`);
    } else if (error instanceof OpenAI.APIConnectionError) {
      throw new Error("OpenAI API 연결 오류: 인터넷 연결을 확인하세요.");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new Error("API 요청 한도 초과: 잠시 후 다시 시도해주세요.");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new Error(
        "OpenAI API 키가 유효하지 않습니다. API 키를 확인해주세요.",
      );
    } else {
      throw new Error(`예상치 못한 오류: ${error.message}`);
    }
  }
}

export async function callOpenAIStructured<T extends z.ZodType>(
  request: OpenAIStructuredRequest<T>,
): Promise<z.infer<T>> {
  if (!process.env.OPENAI_API_KEY) {
    console.log(process.env.NEXT_PUBLIC_APP_ENV);
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log(`OpenAI SDK Structured 호출: 모델 ${request.model}`);
    console.log("요청 정보:", {
      model: request.model,
      messageCount: request.input.length,
      temperature: request.temperature,
      max_completion_tokens: request.max_completion_tokens,
      schemaName: request.schemaName,
    });

    const completion = await openai.responses.parse({
      model: request.model,
      input: request.input,
      text: {
        format: zodTextFormat(request.responseSchema, request.schemaName),
      },
    });

    const result = completion.output_parsed;
    if (!result) {
      throw new Error(
        "AI가 구조화된 응답을 생성하지 못했습니다. 다시 시도해 주세요.",
      );
    }

    console.log(result);

    return result;
  } catch (error: any) {
    console.error("OpenAI SDK Structured 호출 오류:", error);

    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API 오류: ${error.status} - ${error.message}`);
    } else if (error instanceof OpenAI.APIConnectionError) {
      throw new Error("OpenAI API 연결 오류: 인터넷 연결을 확인하세요.");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new Error("API 요청 한도 초과: 잠시 후 다시 시도해주세요.");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new Error(
        "OpenAI API 키가 유효하지 않습니다. API 키를 확인해주세요.",
      );
    } else {
      throw new Error(`예상치 못한 오류: ${error.message}`);
    }
  }
}
