export interface ClientWithStats {
  id:                string;
  dni:               string;
  name:              string;
  phone:             string | null;
  email:             string | null;
  pointsBalance:     number;
  pointsAccumulated: number;
  pointsUsed:        number;
  createdAt:         Date;
  totalSpent:        number;
  totalPurchases:    number;
  firstPurchase:     Date | null;
  lastPurchase:      Date | null;
}