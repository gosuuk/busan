import { BusanMascot } from "@/components/brand/busan-mascot";

export function PageLoading() {
  return (
    <div className="grid min-h-[420px] place-items-center bg-paper px-6 py-16">
      <div className="text-center">
        <BusanMascot className="mx-auto h-24 w-24" mood="loading" />
        <p className="mt-5 text-sm font-bold text-blue-600">Busan IT</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">
          페이지를 준비하고 있습니다
        </h2>
        <p className="mt-3 text-sm text-ink/55">
          모임과 멤버 정보를 불러오는 중입니다.
        </p>
      </div>
    </div>
  );
}
