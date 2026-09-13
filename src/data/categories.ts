import pdfPrintImg from "../assets/popular/pdf-print.png";
import annualReportImg from "../assets/popular/annual-report.png";
import paperbackBooksImg from "../assets/popular/paperback-books.png";
import ebookPrintingImg from "../assets/popular/ebook-printing.png";
import studyMaterialImg from "../assets/popular/study-material-printing.png";
import thesisPrintImg from "../assets/popular/thesis-print.png";
import noteCardsImg from "../assets/popular/note-cards.jpg";
import certificatePrintingImg from "../assets/popular/certificate-printing.jpg";
import flashCardsImg from "../assets/popular/flash-cards.jpg";
import blackBookBindingImg from "../assets/popular/black-book-binding.jpg";
import whiteBookBindingImg from "../assets/popular/white-book-binding.jpg";

export interface Subcategory {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  startingPrice?: number;
}

export interface Category {
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    name: "DOCUMENTS",
    slug: "documents",
    subcategories: [
      { name: "PDF PRINT", slug: "pdf-print", image: pdfPrintImg },
      { name: "ANNUAL REPORT PRINTING", slug: "annual-report-printing", image: annualReportImg },
    ],
  },
  {
    name: "BOOKS",
    slug: "books",
    subcategories: [
      { name: "PAPERBACK / SOFTCOVER / SOFTBACK BOOKS", slug: "paperback-books", image: paperbackBooksImg },
      { name: "E-BOOK PRINTING", slug: "ebook-printing", image: ebookPrintingImg },
      { name: "STUDY MATERIAL/GUIDE PRINTING", slug: "study-material-printing", image: studyMaterialImg },
    ],
  },
  {
    name: "CERTIFICATE & CARDS",
    slug: "certificate-cards",
    subcategories: [
      { name: "NOTE CARDS", slug: "notecards", image: noteCardsImg },
      { name: "CERTIFICATE PRINTING", slug: "certificate-printing", image: certificatePrintingImg },
      { name: "FLASH CARD PRINTING", slug: "flash-card-printing", image: flashCardsImg },
    ],
  },
  {
    name: "Thesis & Dissertation",
    slug: "thesis-dissertation",
    subcategories: [
      { name: "Thesis Print", slug: "thesis-print", image: thesisPrintImg },
    ],
  },
  {
    name: "Black Book & White Book Binding",
    slug: "black-book-white-book-binding",
    subcategories: [
      { name: "Black Book Binding", slug: "black-book-binding", image: blackBookBindingImg },
      { name: "White Book Binding", slug: "white-book-binding", image: whiteBookBindingImg },
    ],
  },
];
