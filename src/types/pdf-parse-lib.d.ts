// pdf-parse's main entry runs debug code (reads a sample PDF) when imported
// without a parent module. Importing the internal lib path avoids that.
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFData {
    text: string;
    numpages: number;
    info: unknown;
  }
  function pdfParse(data: Buffer | Uint8Array): Promise<PDFData>;
  export default pdfParse;
}
