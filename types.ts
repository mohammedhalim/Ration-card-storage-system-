
export interface RationCard {
  id: string;
  ownerName: string;
  membersCount: number;
  withdrawnLoaves: number;
  lastWithdrawalDate: string;
  isPaid: boolean;
  paidAmount: number;
  notes: string;
  createdAt: string;
}

export type AppView = 'LIST' | 'ADD' | 'EDIT';
