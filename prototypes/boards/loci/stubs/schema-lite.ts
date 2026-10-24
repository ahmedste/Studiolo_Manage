// The map only needs the storable-text check; the full zod schema stays in the app.
const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
export const storableText = (value: string) => !value.includes("\u0000") && !loneSurrogate.test(value);
