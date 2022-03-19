import { render, screen } from "@testing-library/react";
import App from "./App";

test("if app is working and have title", () => {
  render(<App />);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});
