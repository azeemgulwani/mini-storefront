import Catalog from "./components/Catalog";

export default function Page() {
  return (
    <main className="min-h-dvh p-6 md:p-10 bg-gray-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold mb-6">Mini-Storefront</h1>
        <Catalog />
      </div>
    </main>
  );
}