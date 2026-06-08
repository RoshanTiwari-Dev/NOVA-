import "express";

declare global {
  namespace Express {
    interface Request {
      query: Record<string, string | string[] | undefined>;
      headers: Record<string, string | string[] | undefined>;
      protocol: string;
      originalUrl: string;
      hostname?: string;
    }

    interface Response {
      status(code: number): this;
      json(body: any): this;
      cookie(name: string, val: string, options?: any): this;
      clearCookie(name: string, options?: any): this;
      redirect(status: number, url: string): void;
      redirect(url: string): void;
      set(field: string, value?: string | string[]): this;
      set(field: Record<string, string | string[]>): this;
      end(data?: any, encoding?: string): void;
    }
  }
}

export {};
