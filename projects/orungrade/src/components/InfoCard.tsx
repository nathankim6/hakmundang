
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "highlight";
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, variant = "default", className }) => {
  return (
    <Card className={`border border-gray-100 ${
      variant === "highlight" ? "bg-blue-50/50" : "bg-white"
    } ${className || ""}`}>
      <CardHeader className={`${
        variant === "highlight" ? "border-b border-blue-100/50" : "border-b border-gray-100"
      } pb-3`}>
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
};

export default InfoCard;
