export interface ProductFilters {
  page:              number;
  limit:             number;
  search?:           string;
  category?:         string;
  pharmaceuticalForm?: string;
  laboratory?:       string;
  stockStatus?:      string;
  expiryStatus?:     string;
  sortBy?:           string;
}