export interface AIProvider {
  generateText(
    prompt: string,
    model?: string
  ): Promise<string>;

  generateJson<T>(
    prompt: string,
    model?: string
  ): Promise<T>;

  embed(
    text: string
  ): Promise<number[]>;
}