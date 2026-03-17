"use client";

import { useState } from "react";
import { Select, SelectItem } from "@heroui/select";
import { countriesphonehome } from "@/shared/data/countriesphonehome";
import Input from "./atoms/input";
import Image from "next/image";

interface PhoneInputProps {
  value?: string;
  onChange?: (phone: string) => void;
  required?: boolean;
}

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={code}
      width={size}
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

export default function PhoneInput({
  value = "",
  onChange,
  required = false,
}: PhoneInputProps) {
  const [country, setCountry] = useState("PE");
  const [phone, setPhone] = useState(value);

  const selectedCountry = countriesphonehome.find(
    (c) => c.code === country
  );

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (onChange) {
      onChange(`${selectedCountry?.dial}${val}`);
    }
  };

  return (
    <div className="flex gap-2 w-full items-end">
      <Select
        label="País"
        selectedKeys={[country]}
        onSelectionChange={(keys: any) =>
          setCountry(Array.from(keys)[0] as string)
        }
        className="w-[130px] min-w-[130px] input-citrica-ui"
        variant="bordered"
        radius="sm"
        size="md"
        classNames={{ trigger: "!bg-white" }}
        renderValue={(items) => {
          return items.map((item) => {
            const c = countriesphonehome.find((ct) => ct.code === item.key);
            if (!c) return null;
            return (
              <span key={item.key} className="text-sm flex items-center gap-1.5">
                <FlagImg code={c.code} size={18} />
                <span>{c.dial}</span>
              </span>
            );
          });
        }}
      >
        {countriesphonehome.map((c) => (
          <SelectItem key={c.code} textValue={`${c.name} ${c.dial}`}>
            <span className="text-sm flex items-center gap-2">
              <FlagImg code={c.code} size={20} />
              <span>{c.dial}</span>
            </span>
          </SelectItem>
        ))}
      </Select>

      <Input
        type="tel"
        label={required ? <span>Teléfono <span style={{ color: '#f31260' }}>*</span></span> : "Teléfono"}
        value={phone}
        onValueChange={handlePhoneChange}
        placeholder="987654321"
        variant="bordered"
        color="primary"
        radius="sm"
        fullWidth
      />
    </div>
  );
}
