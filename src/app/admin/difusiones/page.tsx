import type { Metadata } from "next";
import { DiffusionClient } from "./DiffusionClient";

export const metadata: Metadata = {
  title: "Difusiones — SendHope Admin",
};

export default function DifusionesPage() {
  return (
    <div className="py-6 px-4 md:px-8">
      <DiffusionClient />
    </div>
  );
}
