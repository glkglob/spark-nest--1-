import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link, 
  Plus, 
  Search, 
  Filter, 
  Star,
  TrendingUp,
  Shield,
  FileText,
  Coins,
  Eye,
  Download,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';

interface SmartContract {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'quality' | 'supply_chain' | 'compliance' | 'insurance';
  price: number;
  rating: number;
  downloads: number;
  author: string;
  verified: boolean;
  features: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  blockchain: 'ethereum' | 'polygon' | 'binance' | 'arbitrum';
  gasEstimate: number;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  author: string;
  verified: boolean;
  features: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  blockchain: string;
  gasEstimate: number;
}

const BlockchainMarketplace: React.FC = () => {
  const [contracts, setContracts] = useState<SmartContract[]>([
    {
      id: 'contract_001',
      name: 'Construction Payment Escrow',
      description: 'Automated payment escrow system for construction milestones with dispute resolution',
      category: 'payment',
      price: 299,
      rating: 4.8,
      downloads: 1247,
      author: 'BlockBuild Solutions',
      verified: true,
      features: [
        'Milestone-based payments',
        'Automatic dispute resolution',
        'Multi-signature wallet support',
        'Integration with project management tools'
      ],
      tags: ['escrow', 'payments', 'milestones', 'disputes'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      blockchain: 'ethereum',
      gasEstimate: 0.05
    },
    {
      id: 'contract_002',
      name: 'Quality Certification NFT',
      description: 'NFT-based quality certificates for construction materials and completed work',
      category: 'quality',
      price: 199,
      rating: 4.6,
      downloads: 892,
      author: 'QualityChain',
      verified: true,
      features: [
        'Immutable quality records',
        'Material traceability',
        'Inspector verification',
        'Transferable certificates'
      ],
      tags: ['nft', 'quality', 'certification', 'materials'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      blockchain: 'polygon',
      gasEstimate: 0.02
    },
    {
      id: 'contract_003',
      name: 'Supply Chain Tracker',
      description: 'End-to-end supply chain tracking with real-time updates and transparency',
      category: 'supply_chain',
      price: 449,
      rating: 4.9,
      downloads: 2156,
      author: 'SupplyChain Pro',
      verified: true,
      features: [
        'Real-time tracking',
        'Supplier verification',
        'Automated compliance checks',
        'Environmental impact tracking'
      ],
      tags: ['supply-chain', 'tracking', 'transparency', 'compliance'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-22',
      blockchain: 'arbitrum',
      gasEstimate: 0.08
    },
    {
      id: 'contract_004',
      name: 'Safety Compliance Monitor',
      description: 'Automated safety compliance monitoring with real-time alerts and reporting',
      category: 'compliance',
      price: 349,
      rating: 4.7,
      downloads: 1563,
      author: 'SafetyFirst Chain',
      verified: true,
      features: [
        'Real-time compliance monitoring',
        'Automated reporting',
        'Regulatory updates',
        'Penalty calculation'
      ],
      tags: ['safety', 'compliance', 'monitoring', 'regulations'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19',
      blockchain: 'binance',
      gasEstimate: 0.06
    },
    {
      id: 'contract_005',
      name: 'Construction Insurance Pool',
      description: 'Decentralized insurance pool for construction projects with automated claims',
      category: 'insurance',
      price: 599,
      rating: 4.5,
      downloads: 734,
      author: 'InsureBuild',
      verified: false,
      features: [
        'Decentralized risk pooling',
        'Automated claims processing',
        'Smart contract coverage',
        'Peer-to-peer insurance'
      ],
      tags: ['insurance', 'risk', 'claims', 'pooling'],
      createdAt: '2024-01-08',
      updatedAt: '2024-01-16',
      blockchain: 'ethereum',
      gasEstimate: 0.12
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'payment', label: 'Payment Systems' },
    { value: 'quality', label: 'Quality Assurance' },
    { value: 'supply_chain', label: 'Supply Chain' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'insurance', label: 'Insurance' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <Coins className="h-4 w-4" />;
      case 'quality': return <Shield className="h-4 w-4" />;
      case 'supply_chain': return <Link className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return 'bg-blue-100 text-blue-800';
      case 'polygon': return 'bg-purple-100 text-purple-800';
      case 'binance': return 'bg-yellow-100 text-yellow-800';
      case 'arbitrum': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesCategory = selectedCategory === 'all' || contract.category === selectedCategory;
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'price':
        return a.price - b.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleDeployContract = (contractId: string) => {
    console.log(`Deploying contract ${contractId}`);
    // Mock deployment logic
  };

  const handlePurchaseContract = (contractId: string) => {
    console.log(`Purchasing contract ${contractId}`);
    // Mock purchase logic
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Link className="h-8 w-8 text-blue-600" />
            Blockchain Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover and deploy smart contracts for construction industry applications
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit Contract
        </Button>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold">{contracts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {contracts.reduce((sum, c) => sum + c.downloads, 0).toLocaleString()}
                </p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Contracts</p>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter(c => c.verified).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Developers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(contracts.map(c => c.author)).size}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Contracts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-contracts">My Contracts</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Featured Contracts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Smart Contracts</h2>
            <div className="grid gap-6">
              {sortedContracts.slice(0, 3).map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(contract.category)}
                        <div>
                          <h3 className="font-semibold text-lg">{contract.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {contract.author} {contract.verified && <CheckCircle className="h-4 w-4 text-green-500 inline ml-1" />}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getBlockchainColor(contract.blockchain)}>
                          {contract.blockchain}
                        </Badge>
                        {contract.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{contract.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">${contract.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{contract.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Downloads</p>
                        <p className="font-semibold">{contract.downloads.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gas Estimate</p>
                        <p className="font-semibold">{contract.gasEstimate} ETH</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {contract.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeployContract(contract.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Deploy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handlePurchaseContract(contract.id)}
                      >
                        <Coins className="h-3 w-3 mr-1" />
                        Purchase
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Contracts Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Smart Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(contract.category)}
                        <h3 className="font-semibold text-sm">{contract.name}</h3>
                      </div>
                      <Badge className={getBlockchainColor(contract.blockchain)}>
                        {contract.blockchain}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {contract.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{contract.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contract.downloads.toLocaleString()} downloads
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">${contract.price}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" className="h-7 px-2">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-contracts" className="space-y-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Manage your purchased and deployed smart contracts. Track usage, monitor performance, and access support.
            </AlertDescription>
          </Alert>

          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
            <p className="mb-4">You haven't purchased or deployed any smart contracts.</p>
            <Button>Browse Marketplace</Button>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <Alert>
            <Link className="h-4 w-4" />
            <AlertDescription>
              Monitor your smart contract deployments across different blockchain networks. Track gas usage, transaction status, and contract interactions.
            </AlertDescription>
          </Alert>

          <div className="text-center py-8 text-muted-foreground">
            <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Deployments</h3>
            <p className="mb-4">You haven't deployed any smart contracts yet.</p>
            <Button>Deploy Your First Contract</Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Volume</span>
                    <span className="font-medium">$2.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Contracts</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Gas Cost</span>
                    <span className="font-medium">0.08 ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Systems</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Assurance</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Supply Chain</span>
                    <span className="font-medium">27%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blockchain Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Ethereum</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Polygon</span>
                    <span className="font-medium">31%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Arbitrum</span>
                    <span className="font-medium">27%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(selectedContract.category)}
                  <div>
                    <CardTitle>{selectedContract.name}</CardTitle>
                    <CardDescription>
                      by {selectedContract.author} {selectedContract.verified && <CheckCircle className="h-4 w-4 text-green-500 inline ml-1" />}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedContract(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedContract.description}</p>
              
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedContract.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">${selectedContract.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{selectedContract.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="font-semibold">{selectedContract.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gas Estimate</p>
                  <p className="font-semibold">{selectedContract.gasEstimate} ETH</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedContract.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handlePurchaseContract(selectedContract.id)}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Purchase Contract
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDeployContract(selectedContract.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Deploy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlockchainMarketplace;
