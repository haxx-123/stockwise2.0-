import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GlassCard, Button, Input } from '../components/ui/GlassComponents';
import { Product, Batch } from '../types';
import { formatStock, getTotalSmallUnits, cn } from '../lib/utils';
import { ChevronDown, ChevronUp, Search, Plus, FileSpreadsheet, Camera } from 'lucide-react';
import * as xlsx from 'xlsx';
import html2canvas from 'html2canvas';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    // 1. Fetch Products
    const { data: prodData } = await supabase.from('products').select('*');
    // 2. Fetch Batches
    const { data: batchData } = await supabase.from('batches').select('*');

    if (prodData && batchData) {
      // Join Logic
      const joined = prodData.map((p: Product) => ({
        ...p,
        batches: batchData.filter((b: Batch) => b.product_id === p.id)
      }));
      setProducts(joined);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleScreenshot = async () => {
    const element = document.getElementById('inventory-list');
    if (!element) return;
    
    // Hack: temporarily expand height
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      scale: 2,
      ignoreElements: (el) => el.tagName === 'NAV' || el.tagName === 'ASIDE'
    });

    // Restore
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    const link = document.createElement('a');
    link.download = `inventory-snapshot-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExport = () => {
    const ws = xlsx.utils.json_to_sheet(
        products.map(p => ({
            Name: p.name,
            SKU: p.sku,
            Total_Stock: formatStock(
                p.batches?.reduce((acc, b) => acc + b.quantity_large, 0) || 0,
                p.batches?.reduce((acc, b) => acc + b.quantity_small, 0) || 0,
                p.unit_large,
                p.unit_small,
                p.conversion_rate
            )
        }))
    );
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Inventory");
    xlsx.writeFile(wb, "stockwise_export.xlsx");
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold">Inventory</h2>
           <p className="opacity-60">Manage stock, batches, and expirations.</p>
        </div>
        
        <div className="flex gap-2">
           <Button variant="ghost" onClick={handleScreenshot}>
             <Camera className="w-4 h-4" /> Snap
           </Button>
           <Button variant="ghost" onClick={handleExport}>
             <FileSpreadsheet className="w-4 h-4" /> Export
           </Button>
           <Button>
             <Plus className="w-4 h-4" /> Add Batch
           </Button>
        </div>
      </div>

      <div className="relative">
         <Search className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
         <Input 
           placeholder="Search products by Name or SKU..." 
           className="pl-10"
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div id="inventory-list" className="space-y-4 pb-20">
        {loading ? (
           <div className="flex justify-center p-12">Loading inventory...</div>
        ) : filteredProducts.map((product, index) => {
          const totalLarge = product.batches?.reduce((acc, b) => acc + b.quantity_large, 0) || 0;
          const totalSmall = product.batches?.reduce((acc, b) => acc + b.quantity_small, 0) || 0;
          const isExpanded = expandedId === product.id;

          return (
            <div 
              key={product.id} 
              className="animate-fade-in-up" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
               <GlassCard 
                  className={cn(
                    "cursor-pointer hover:border-[var(--color-accent)]/30 transition-colors", 
                    isExpanded ? "ring-2 ring-[var(--color-accent)]/50" : ""
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
               >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg text-[var(--color-accent)]">
                          {product.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <div className="flex gap-2 text-sm opacity-60">
                             <span className="font-mono bg-black/5 px-1 rounded">{product.sku}</span>
                             <span>{product.category}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="text-right">
                       <div className="font-mono font-bold text-xl">
                          {formatStock(totalLarge, totalSmall, product.unit_large, product.unit_small, product.conversion_rate)}
                       </div>
                       <div className="text-xs opacity-50 flex items-center justify-end gap-1 mt-1">
                          {product.batches?.length || 0} Batches
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                       </div>
                    </div>
                 </div>

                 {isExpanded && (
                   <div className="mt-6 pt-4 border-t border-[var(--color-text-primary)]/10">
                      <table className="w-full text-sm">
                        <thead>
                           <tr className="opacity-50 text-left">
                              <th className="pb-2">Batch #</th>
                              <th className="pb-2">Expiry</th>
                              <th className="pb-2 text-right">Qty</th>
                              <th className="pb-2 text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody>
                           {product.batches?.map(batch => (
                              <tr key={batch.id} className="border-t border-[var(--color-text-primary)]/5">
                                 <td className="py-2 font-mono">{batch.batch_number}</td>
                                 <td className="py-2">{batch.expiry_date}</td>
                                 <td className="py-2 text-right font-mono">
                                   {batch.quantity_large} / {batch.quantity_small}
                                 </td>
                                 <td className="py-2 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs">Active</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                 )}
               </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;