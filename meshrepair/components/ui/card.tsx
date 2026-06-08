import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <MuiCard className={className} ref={ref} {...props} />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <Box className={className} ref={ref} sx={{ p: 3, pb: 1.5 }} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <Box
      className={className}
      ref={ref}
      sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <Box
      className={className}
      ref={ref}
      sx={{ color: "text.secondary", fontSize: 14, mt: 0.75 }}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <MuiCardContent className={className} ref={ref} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <Box className={className} ref={ref} sx={{ p: 3, pt: 0 }} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
