/**
 * Blockchain Service Hook
 * Provides blockchain marketplace and smart contract operations
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface SmartContract {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'project_management' | 'supply_chain' | 'quality_assurance' | 'payment' | 'compliance';
  price: number;
  currency: 'ETH' | 'BTC' | 'USDC' | 'USD';
  author: string;
  rating: number;
  downloads: number;
  features: string[];
  compatibility: string[];
  sourceCode: string;
  abi: any[];
  bytecode: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ContractDeployment {
  id: string;
  contractId: string;
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum';
  address: string;
  transactionHash: string;
  status: 'deploying' | 'deployed' | 'failed';
  gasUsed: number;
  gasPrice: number;
  deployedBy: string;
  deployedAt: string;
  interactions: number;
  lastInteraction: string;
}

export interface ContractAnalytics {
  contractId: string;
  deploymentId: string;
  totalInteractions: number;
  uniqueUsers: number;
  gasUsage: {
    total: number;
    average: number;
    peak: number;
  };
  transactionVolume: number;
  errorRate: number;
  uptime: number;
  performanceMetrics: {
    averageResponseTime: number;
    throughput: number;
    latency: number;
  };
  usageStats: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface ContractInteraction {
  id: string;
  contractId: string;
  deploymentId: string;
  method: string;
  parameters: Record<string, any>;
  result: any;
  transactionHash: string;
  gasUsed: number;
  executedBy: string;
  executedAt: string;
  status: 'pending' | 'success' | 'failed';
}

export interface ContractVerification {
  id: string;
  contractId: string;
  verificationType: 'source_code' | 'bytecode' | 'metadata';
  status: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
  verifiedBy: string;
  details: string;
  compilerVersion: string;
  optimization: boolean;
  runs: number;
}

export interface UserContract {
  id: string;
  userId: string;
  contractId: string;
  deploymentId?: string;
  purchasedAt: string;
  status: 'purchased' | 'deployed' | 'active' | 'inactive';
  usage: {
    interactions: number;
    lastUsed: string;
    totalGasUsed: number;
  };
}

export function useBlockchain() {
  const { user, token } = useAuth();
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [deployments, setDeployments] = useState<ContractDeployment[]>([]);
  const [analytics, setAnalytics] = useState<ContractAnalytics[]>([]);
  const [interactions, setInteractions] = useState<ContractInteraction[]>([]);
  const [verifications, setVerifications] = useState<ContractVerification[]>([]);
  const [userContracts, setUserContracts] = useState<UserContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitContract = useCallback(async (contractData: Partial<SmartContract>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newContract = await api.submitSmartContract(contractData);
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to submit contract');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const purchaseContract = useCallback(async (contractId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const purchase = await api.purchaseSmartContract(contractId);
      setUserContracts(prev => [...prev, purchase]);
      return purchase;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to purchase contract');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deployContract = useCallback(async (contractId: string, network: string, constructorArgs?: any[]) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const deployment = await api.deployMarketplaceContract(contractId, network, constructorArgs);
      setDeployments(prev => [...prev, deployment]);
      return deployment;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to deploy contract');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const interactWithContract = useCallback(async (deploymentId: string, method: string, parameters: Record<string, any>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const interaction = await api.interactWithContract(deploymentId, method, parameters);
      setInteractions(prev => [...prev, interaction]);
      return interaction;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to interact with contract');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getContractAnalytics = useCallback(async (contractId?: string, deploymentId?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const analyticsData = await api.getContractAnalytics(contractId, deploymentId);
      if (contractId) {
        setAnalytics(prev => prev.map(a => a.contractId === contractId ? analyticsData : a));
      } else {
        setAnalytics([analyticsData]);
      }
      return analyticsData;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get contract analytics');
      }
      throw err;
    }
  }, [token]);

  const verifyContract = useCallback(async (contractId: string, verificationData: Partial<ContractVerification>) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const verification = await api.verifySmartContract(contractId, verificationData);
      setVerifications(prev => [...prev, verification]);
      return verification;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to verify contract');
      }
      throw err;
    }
  }, [token]);

  const getUserContracts = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const contracts = await api.getUserContracts();
      setUserContracts(contracts);
      return contracts;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get user contracts');
      }
      throw err;
    }
  }, [token]);

  const compileContract = useCallback(async (sourceCode: string, compilerVersion?: string, optimization?: boolean) => {
    try {
      return await api.compileSmartContract(sourceCode, compilerVersion, optimization);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to compile contract');
      }
      throw err;
    }
  }, []);

  // Legacy blockchain methods
  const createBlockchainTransaction = useCallback(async (transactionData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.createBlockchainTransaction(transactionData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create blockchain transaction');
      }
      throw err;
    }
  }, [token]);

  const mintNFT = useCallback(async (nftData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.mintNFT(nftData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to mint NFT');
      }
      throw err;
    }
  }, [token]);

  const auditBlockchain = useCallback(async (contractAddress: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.auditBlockchain(contractAddress);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to audit blockchain');
      }
      throw err;
    }
  }, [token]);

  const trackSupplyChain = useCallback(async (trackingId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.trackSupplyChain(trackingId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to track supply chain');
      }
      throw err;
    }
  }, [token]);

  const verifyIdentity = useCallback(async (identityData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.verifyIdentity(identityData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to verify identity');
      }
      throw err;
    }
  }, [token]);

  const certifyQuality = useCallback(async (qualityData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.certifyQuality(qualityData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to certify quality');
      }
      throw err;
    }
  }, [token]);

  return {
    contracts,
    deployments,
    analytics,
    interactions,
    verifications,
    userContracts,
    loading,
    error,
    submitContract,
    purchaseContract,
    deployContract,
    interactWithContract,
    getContractAnalytics,
    verifyContract,
    getUserContracts,
    compileContract,
    createBlockchainTransaction,
    mintNFT,
    auditBlockchain,
    trackSupplyChain,
    verifyIdentity,
    certifyQuality,
  };
}
