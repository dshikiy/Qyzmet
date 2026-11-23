"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TogglePremiumButton({
  providerId,
  isPremium,
}: {
  providerId: string;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/providers/${providerId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPremium: !isPremium }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={isPremium ? "secondary" : "outline"}
      disabled={loading}
      onClick={toggle}
    >
      {isPremium ? "Premium өшіру" : "Premium қосу"}
    </Button>
  );
}

export function ToggleCategoryButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={toggle}
    >
      {isActive ? "Өшіру" : "Қосу"}
    </Button>
  );
}

export function CreateCategoryForm() {
  const router = useRouter();
  const [nameKk, setNameKk] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Wrench");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameKk, slug, icon, isActive: true, sortOrder: 10 }),
    });
    setNameKk("");
    setSlug("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <Input
        placeholder="Санат атауы (қаз.)"
        value={nameKk}
        onChange={(e) => setNameKk(e.target.value)}
        required
      />
      <Input
        placeholder="slug (мыс: zondeu)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />
      <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
        <option value="Wrench">Wrench</option>
        <option value="Zap">Zap</option>
        <option value="Sparkles">Sparkles</option>
        <option value="GraduationCap">GraduationCap</option>
        <option value="Settings">Settings</option>
        <option value="LayoutGrid">LayoutGrid</option>
      </Select>
      <Button type="submit" disabled={loading}>
        Санат қосу
      </Button>
    </form>
  );
}

export function ToggleReviewButton({
  reviewId,
  isVisible,
}: {
  reviewId: string;
  isVisible: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={loading}
      onClick={toggle}
    >
      {isVisible ? "Жасыру" : "Көрсету"}
    </Button>
  );
}

export function CommissionStatusButton({
  commissionId,
  status,
}: {
  commissionId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markPaid() {
    setLoading(true);
    await fetch(`/api/admin/commissions/${commissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "PAID" ? "PENDING" : "PAID" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={status === "PAID" ? "secondary" : "outline"}
      disabled={loading}
      onClick={markPaid}
    >
      {status === "PAID" ? "Төленді ✓" : "Төленді деп белгілеу"}
    </Button>
  );
}

export function CreatePromotionForm({
  providers,
}: {
  providers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [type, setType] = useState("FEATURED_LISTING");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerId) return;
    setLoading(true);
    await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, type, startsAt, expiresAt, status: "ACTIVE" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <Select value={providerId} onChange={(e) => setProviderId(e.target.value)} required>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="FEATURED_LISTING">Таңдаулы орын</option>
        <option value="TOP_SEARCH">Іздеуде жоғары</option>
        <option value="CATEGORY_SPOTLIGHT">Санатта ерекшелеу</option>
      </Select>
      <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
      <Button type="submit" disabled={loading || providers.length === 0}>
        Қосу
      </Button>
    </form>
  );
}

export function CreateAdvertisementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [advertiserName, setAdvertiserName] = useState("");
  const [placement, setPlacement] = useState("homepage");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/advertisements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        advertiserName,
        placement,
        startsAt,
        expiresAt,
        isActive: true,
      }),
    });
    setTitle("");
    setAdvertiserName("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Input
        placeholder="Жарнама атауы"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Жарнама беруші"
        value={advertiserName}
        onChange={(e) => setAdvertiserName(e.target.value)}
        required
      />
      <Input
        placeholder="Орналасу орны"
        value={placement}
        onChange={(e) => setPlacement(e.target.value)}
        required
      />
      <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
      <Button type="submit" disabled={loading}>
        Жарнама қосу
      </Button>
    </form>
  );
}

