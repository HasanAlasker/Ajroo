
//to check entitelment
import Purchases from 'react-native-purchases';

try {
    const customerInfo = await Purchases.getCustomerInfo();

    if(typeof customerInfo.entitlements.active['Ajroo Pro'] !== "undefined") {
      // Grant user access to entitlement
    }

} catch (e) {
  // Error fetching customer info
}


//pay wall
// import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

// // Make sure to configure a Paywall in the Dashboard first.
// async function presentPaywall(): Promise<boolean> {
    
//     // Present paywall for current offering:
//     const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
    
//     switch (paywallResult) {
//         case PAYWALL_RESULT.NOT_PRESENTED:
//         case PAYWALL_RESULT.ERROR:
//         case PAYWALL_RESULT.CANCELLED:
//             return false;
//         case PAYWALL_RESULT.PURCHASED:
//         case PAYWALL_RESULT.RESTORED:
//             return true;
//         default:
//             return false;
//     }
// }