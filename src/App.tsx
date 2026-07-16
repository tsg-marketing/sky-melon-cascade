
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Massagers from "./pages/Massagers";
import Injector from "./pages/Injector";
import Slicers from "./pages/Slicers";
import LDOGenerator from "./pages/LDOGenerator";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import CalculatorMassager from "./pages/CalculatorMassager";
import Contacts from "./pages/Contacts";
import NotFoundPage from "./pages/NotFoundPage";
import RouteMeta from "./components/site/RouteMeta";
import ScrollToHash from "./components/site/ScrollToHash";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteMeta />
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/massagers" element={<Massagers />} />
          <Route path="/injector" element={<Injector />} />
          <Route path="/slicers" element={<Slicers />} />
          <Route path="/ldogenerator" element={<LDOGenerator />} />
          <Route path="/massagers/:slug" element={<ProductPage categorySlug="massagers" />} />
          <Route path="/injector/:slug" element={<ProductPage categorySlug="injector" />} />
          <Route path="/slicers/:slug" element={<ProductPage categorySlug="slicers" />} />
          <Route path="/ldogenerator/:slug" element={<ProductPage categorySlug="ldogenerator" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/calculator_massager" element={<CalculatorMassager />} />
          <Route path="/contacts" element={<Contacts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* Динамические категории — держим НИЖЕ всех статических маршрутов */}
          <Route path="/:slug" element={<CategoryPage />} />
          <Route path="/:slug/:productSlug" element={<CategoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;