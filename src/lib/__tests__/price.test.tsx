import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Price } from "@/components/price";

describe("<Price>", () => {
  it("shows a struck-through compare-at price only when it is higher", () => {
    const { container, rerender } = render(<Price amount="259.00" compareAt="329.00" locale="en" />);
    expect(screen.getByText("฿259")).toBeTruthy();
    expect(container.querySelector("s")?.textContent).toContain("฿329");
    rerender(<Price amount="259.00" compareAt="259.00" locale="en" />);
    expect(container.querySelector("s")).toBeNull();
  });
});
