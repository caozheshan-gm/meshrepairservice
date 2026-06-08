import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";

async function AdminContent() {
  await requireAdmin();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Mesh Repair Service</p>
        <h1 className="text-3xl font-semibold">管理后台</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>产品追溯</CardTitle>
            <CardDescription>
              浏览产品、创建铭牌序列号、管理二维码和维修记录。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/products">进入产品列表</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新增产品</CardTitle>
            <CardDescription>
              为本厂产品或客户送修产品创建唯一序列号和二维码。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/products/new">新增产品</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Suspense>
        <AdminContent />
      </Suspense>
    </main>
  );
}
