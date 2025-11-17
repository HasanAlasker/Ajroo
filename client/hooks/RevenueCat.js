import { useState, useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// Conversion rate (update this as needed)
const USD_TO_JD = 0.71; // 1 USD ≈ 0.71 JD (check current rate)

export const useRevenueCat = () => {
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferings();
    fetchCustomerInfo();
  }, []);

  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('📦 Offerings fetched:', offerings);
      
      if (offerings.current !== null) {
        console.log('📦 Current offering:', offerings.current);
        console.log('📦 Available packages:', offerings.current.availablePackages);
        setOfferings(offerings.current);
      } else {
        console.log('⚠️ No current offering found');
      }
    } catch (error) {
      console.error('❌ Error fetching offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerInfo = async (forceRefresh = false) => {
    try {
      console.log(`👤 Fetching customer info (force refresh: ${forceRefresh})...`);
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('👤 Customer info:', customerInfo);
      console.log('🎯 Active entitlements:', customerInfo.entitlements.active);
      setCustomerInfo(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('❌ Error fetching customer info:', error);
      return null;
    }
  };

  const purchasePackage = async (packageToPurchase) => {
    try {
      console.log('💳 Attempting to purchase:', packageToPurchase.identifier);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Force update local state with fresh data
      setCustomerInfo(customerInfo);
      
      console.log('✅ Purchase successful!');
      console.log('🎯 Active entitlements:', customerInfo.entitlements.active);
      
      // Check if user has active subscription - FIXED entitlement names
      if (customerInfo.entitlements.active['pro'] !== undefined) {
        return { success: true, entitlement: 'pro', customerInfo };
      }
      if (customerInfo.entitlements.active['starter'] !== undefined) {
        return { success: true, entitlement: 'starter', customerInfo };
      }
      if (customerInfo.entitlements.active['premium'] !== undefined) {
        return { success: true, entitlement: 'premium', customerInfo };
      }
      
      return { success: true, customerInfo };
    } catch (error) {
      if (!error.userCancelled) {
        console.error('❌ Error purchasing package:', error);
      } else {
        console.log('⚠️ User cancelled purchase');
      }
      return { success: false, error };
    }
  };

  const restorePurchases = async () => {
    try {
      console.log('🔄 Restoring purchases...');
      
      // This forces RevenueCat to sync with Apple/Google servers
      const restoredInfo = await Purchases.restorePurchases();
      
      // Update local state immediately
      setCustomerInfo(restoredInfo);
      
      console.log('✅ Purchases restored');
      console.log('🎯 Active entitlements after restore:', restoredInfo.entitlements.active);
      
      // Check if user has any active entitlements
      const hasActiveEntitlement = Object.keys(restoredInfo.entitlements.active).length > 0;
      
      return { 
        success: true, 
        customerInfo: restoredInfo,
        hasActiveEntitlement 
      };
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
      return { success: false, error, hasActiveEntitlement: false };
    }
  };

  const hasActiveSubscription = () => {
    return (
      customerInfo?.entitlements.active['pro'] !== undefined ||
      customerInfo?.entitlements.active['starter'] !== undefined ||
      customerInfo?.entitlements.active['premium'] !== undefined
    );
  };

  const getActiveSubscriptionType = () => {
    if (!customerInfo) return null;
    
    // Check in order of priority (highest to lowest)
    // FIXED: Use correct entitlement identifiers
    if (customerInfo.entitlements.active['premium']) return 'premium';
    if (customerInfo.entitlements.active['starter']) return 'starter';
    if (customerInfo.entitlements.active['pro']) return 'pro';
    
    return null;
  };

  // Helper function to convert price to JD
  const convertToJD = (priceInUSD) => {
    // Extract numeric value from price string (e.g., "$9.99" -> 9.99)
    const numericPrice = parseFloat(priceInUSD.replace(/[^0-9.]/g, ''));
    const jdPrice = (numericPrice * USD_TO_JD).toFixed(2);
    return `${jdPrice} JD`;
  };

  // Get package by identifier with JD price
  const getPackageWithJDPrice = (identifier) => {
    if (!offerings) {
      console.log('⚠️ No offerings available');
      return null;
    }
    
    console.log('🔍 Looking for package:', identifier);
    console.log('📦 Available packages:', offerings.availablePackages.map(p => p.identifier));
    
    const pkg = offerings.availablePackages.find(
      (p) => p.identifier === identifier
    );
    
    if (pkg) {
      console.log('✅ Found package:', pkg.identifier, pkg.product.priceString);
      return {
        ...pkg,
        jdPrice: convertToJD(pkg.product.priceString),
      };
    }
    
    console.log('❌ Package not found:', identifier);
    return null;
  };

  // Force refresh customer info (useful after external subscription changes)
  const refreshCustomerInfo = async () => {
    console.log('🔄 Force refreshing customer info...');
    return await fetchCustomerInfo(true);
  };

  return {
    offerings,
    customerInfo,
    loading,
    purchasePackage,
    restorePurchases,
    hasActiveSubscription,
    getActiveSubscriptionType,
    convertToJD,
    getPackageWithJDPrice,
    refreshCustomerInfo,
  };
};