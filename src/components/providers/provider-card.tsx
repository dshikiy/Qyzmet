import Link from "next/link";
import { MapPin, Star, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatKzt, formatRating } from "@/lib/utils/format";
import { formatDistanceKm } from "@/lib/utils/geo";

export interface ProviderCardData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  city: string;
  publicLocation: string;
  indicativePrice: number;
  isPremium: boolean;
  isPromoted?: boolean;
  categories: { id: string; nameKk: string; slug: string }[];
  averageRating: number;
  reviewCount: number;
  distanceKm?: number | null;
}

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Card className="flex flex-col justify-between transition-colors hover:border-[#BFDBFE]">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={provider.name}
              src={provider.avatarUrl}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="truncate text-base font-semibold text-[#0F172A]">
                  {provider.name}
                </h3>
                {provider.isPremium && (
                  <Badge variant="premium" className="text-[10px] px-2 py-0">
                    Premium
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
                <span className="truncate">
                  {provider.city}, {provider.publicLocation}
                </span>
                {provider.distanceKm != null && Number.isFinite(provider.distanceKm) && (
                  <span className="shrink-0 font-medium text-[#2563EB]">
                    · {formatDistanceKm(provider.distanceKm)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {provider.isPromoted && (
            <Badge variant="info" className="shrink-0 gap-1">
              <Sparkles className="h-3 w-3" />
              Жарнама
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {provider.categories.slice(0, 3).map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.nameKk}
            </Badge>
          ))}
          {provider.categories.length > 3 && (
            <Badge variant="secondary">+{provider.categories.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3.5">
          <div className="flex items-center gap-1.5 text-sm">
            <Star
              className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]"
              aria-hidden="true"
            />
            <span className="font-semibold text-[#0F172A]">
              {formatRating(provider.averageRating)}
            </span>
            <span className="text-xs text-[#64748B]">
              ({provider.reviewCount} пікір)
            </span>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-[#64748B]">Бағдарлы баға</p>
            <p className="text-sm font-semibold text-[#0F172A]">
              {formatKzt(provider.indicativePrice)}
            </p>
          </div>
        </div>

        <Link href={`/providers/${provider.id}`} className="block">
          <Button variant="outline" className="w-full">
            Профильді көру
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

