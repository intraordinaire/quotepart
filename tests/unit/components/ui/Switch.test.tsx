import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "@/components/ui/Switch";

describe("Switch", () => {
  it("renders with label", () => {
    render(<Switch checked={false} onChange={vi.fn()} label="Toggle me" />);
    expect(screen.getByText("Toggle me")).toBeInTheDocument();
  });

  it("has role=switch with aria-checked=false when off", () => {
    render(<Switch checked={false} onChange={vi.fn()} label="Off" />);
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("aria-checked", "false");
  });

  it("has aria-checked=true when on", () => {
    render(<Switch checked={true} onChange={vi.fn()} label="On" />);
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with toggled value on click", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Click me" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when currently checked", () => {
    const onChange = vi.fn();
    render(<Switch checked={true} onChange={onChange} label="Click me" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
