import { useEffect, type JSX } from "react";
import { useShield } from "@/lib/shield/store";
import type { ScreenId } from "@/lib/shield/types";
import { PhoneChrome } from "./chrome";
import {
  CallScreen,
  CategoryScreen,
  ConnectScreen,
  PostcallScreen,
  PrecallScreen,
} from "./connect-flow";
import { HitScreen } from "./evidence";
import { HomeScreen } from "./home";
import {
  AboriginalScreen,
  AddonsScreen,
  AskLawyerScreen,
  AsicScreen,
  AtoScreen,
  AttorneyScreen,
  BailScreen,
  BusinessScreen,
  CalendarScreen,
  CannabisScreen,
  ComplaintsScreen,
  CopilotScreen,
  CourtPrepScreen,
  DashboardScreen,
  DivorceScreen,
  DocumentScreen,
  EmergencyScreen,
  EstateScreen,
  ExpertsScreen,
  FamilyScreen,
  GloveboxScreen,
  HotlineScreen,
  IdentityScreen,
  LibraryScreen,
  MattersScreen,
  MoreScreen,
  NotificationsScreen,
  PartnerScreen,
  PrivacyScreen,
  ProviderScreen,
  ReferralsScreen,
  RightsScreen,
  SearchScreen,
  ServicesHubScreen,
  SigningScreen,
  TemplatesScreen,
  TermsScreen,
  TicketScreen,
  VaultScreen,
  WalletScreen,
} from "./screens";

const SCREENS: Record<ScreenId, () => JSX.Element> = {
  home: HomeScreen,
  category: CategoryScreen,
  precall: PrecallScreen,
  connect: ConnectScreen,
  call: CallScreen,
  postcall: PostcallScreen,
  rights: RightsScreen,
  aboriginal: AboriginalScreen,
  glovebox: GloveboxScreen,
  emergency: EmergencyScreen,
  family: FamilyScreen,
  document: DocumentScreen,
  complaints: ComplaintsScreen,
  cannabis: CannabisScreen,
  terms: TermsScreen,
  privacy: PrivacyScreen,
  hotline: HotlineScreen,
  asklawyer: AskLawyerScreen,
  templates: TemplatesScreen,
  attorney: AttorneyScreen,
  business: BusinessScreen,
  identity: IdentityScreen,
  copilot: CopilotScreen,
  vault: VaultScreen,
  calendar: CalendarScreen,
  ticket: TicketScreen,
  estate: EstateScreen,
  library: LibraryScreen,
  provider: ProviderScreen,
  addons: AddonsScreen,
  dashboard: DashboardScreen,
  search: SearchScreen,
  notifications: NotificationsScreen,
  services: ServicesHubScreen,
  matters: MattersScreen,
  divorce: DivorceScreen,
  ato: AtoScreen,
  asic: AsicScreen,
  courtprep: CourtPrepScreen,
  bail: BailScreen,
  experts: ExpertsScreen,
  signing: SigningScreen,
  referrals: ReferralsScreen,
  wallet: WalletScreen,
  more: MoreScreen,
  partner: PartnerScreen,
  witness: HitScreen,
  hit: HitScreen,
};

export function ShieldApp() {
  const hydrate = useShield((s) => s.hydrate);
  const screen = useShield((s) => s.screen);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const View = SCREENS[screen] ?? HomeScreen;
  return (
    <PhoneChrome>
      <View />
    </PhoneChrome>
  );
}
