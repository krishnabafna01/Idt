
export interface Message {
  role: 'user' | 'model';
  content: string;
}

export enum Chapter {
  Supply = 'Supply under GST',
  Charge = 'Charge of GST',
  TimeOfSupply = 'Time of Supply',
  ValueOfSupply = 'Value of Supply',
  PlaceOfSupply = 'Place of Supply',
  Exemptions = 'Exemptions',
  ITC = 'Input Tax Credit',
  Registration = 'Registration',
  Returns = 'Returns',
  Refunds = 'Refunds',
  CustomsValuation = 'Customs Valuation',
  FTP = 'Foreign Trade Policy'
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
  activeChapter?: Chapter;
}
