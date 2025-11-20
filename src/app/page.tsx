import { Suspense } from "react";
import DataFilterBar from "@/components/filters/dataFilterBar";
import ContractsList from "@/components/contracts/contractsList";
import Loading from "@/components/loading";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  return (
    <div className="flex flex-col gap-y-4 p-5 text-center">
      <h1 className="text-2xl">Busqueda de procesos SECOP II</h1>
      <div className="flex flex-col items-center gap-y-4 w-full text-center">
        <DataFilterBar />
        <Suspense fallback={<Loading />}>
          <ContractsList
            startDate={startDate}
            endDate={endDate}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
