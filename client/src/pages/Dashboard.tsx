import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, Activity, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState<string>("EURUSD=X");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Queries
  const { data: assets, isLoading: assetsLoading } = trpc.assets.getActive.useQuery();
  const { data: recentSignals, isLoading: signalsLoading, refetch: refetchSignals } = trpc.signals.getRecent.useQuery({ limit: 20 });
  const { data: strongSignals, isLoading: strongLoading } = trpc.signals.getStrong.useQuery({ minStrength: 3, limit: 10 });

  // Mutations
  const analyzeMutation = trpc.signals.analyze.useMutation({
    onSuccess: (data) => {
      setIsAnalyzing(false);
      if (data.direction !== "ESPERAR") {
        toast.success(`Sinal ${data.direction} gerado para ${data.asset}`, {
          description: `Força: ${data.strength}/4 pontos`
        });
        refetchSignals();
      } else {
        toast.info("Nenhum sinal forte detectado", {
          description: "Aguarde melhores condições de confluência"
        });
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error("Erro ao analisar ativo", {
        description: error.message
      });
    }
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    analyzeMutation.mutate({ symbol: selectedAsset });
  };

  const getSignalColor = (direction: string) => {
    if (direction === "CALL") return "text-green-500";
    if (direction === "PUT") return "text-red-500";
    return "text-gray-500";
  };

  const getSignalBadgeVariant = (direction: string): "default" | "destructive" | "outline" => {
    if (direction === "CALL") return "default";
    if (direction === "PUT") return "destructive";
    return "outline";
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bot de Sinais Financeiros
          </h1>
          <p className="text-muted-foreground">
            Análise técnica em tempo real com confluência de indicadores
          </p>
        </div>

        {/* Análise Rápida */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Análise em Tempo Real
            </CardTitle>
            <CardDescription>
              Selecione um ativo e clique em analisar para gerar um sinal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Ativo</label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Selecione um ativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsLoading ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : assets && assets.length > 0 ? (
                      assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.symbol}>
                          {asset.name} ({asset.symbol})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Nenhum ativo disponível</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !selectedAsset}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Sinais */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="recent">Sinais Recentes</TabsTrigger>
            <TabsTrigger value="strong">Sinais Fortes</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            {signalsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recentSignals && recentSignals.length > 0 ? (
              <div className="grid gap-4">
                {recentSignals.map((signal) => (
                  <Card key={signal.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${signal.direction === 'CALL' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {signal.direction === 'CALL' ? (
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{signal.symbol}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getSignalBadgeVariant(signal.direction)}>
                                {signal.direction}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Força: {signal.strength}/4
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatTime(signal.createdAt)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(signal.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">EMA</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.emaSignal || '')}`}>
                            {signal.emaSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">RSI</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.rsiSignal || '')}`}>
                            {signal.rsiSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">BBANDS</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.bbandsSignal || '')}`}>
                            {signal.bbandsSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">MACD</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.macdSignal || '')}`}>
                            {signal.macdSignal}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum sinal encontrado</h3>
                  <p className="text-muted-foreground">
                    Analise alguns ativos para começar a gerar sinais
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="strong" className="mt-6">
            {strongLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : strongSignals && strongSignals.length > 0 ? (
              <div className="grid gap-4">
                {strongSignals.map((signal) => (
                  <Card key={signal.id} className="bg-card border-primary/30 hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${signal.direction === 'CALL' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {signal.direction === 'CALL' ? (
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{signal.symbol}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getSignalBadgeVariant(signal.direction)}>
                                {signal.direction}
                              </Badge>
                              <span className="text-sm font-semibold text-primary">
                                Força: {signal.strength}/4 ⭐
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatTime(signal.createdAt)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(signal.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">EMA</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.emaSignal || '')}`}>
                            {signal.emaSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">RSI</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.rsiSignal || '')}`}>
                            {signal.rsiSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">BBANDS</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.bbandsSignal || '')}`}>
                            {signal.bbandsSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">MACD</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.macdSignal || '')}`}>
                            {signal.macdSignal}
                          </div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Tendência 1h</div>
                          <div className={`text-sm font-medium ${getSignalColor(signal.longTermTrend || '')}`}>
                            {signal.longTermTrend}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum sinal forte encontrado</h3>
                  <p className="text-muted-foreground">
                    Sinais fortes aparecem quando há confluência de 3 ou 4 indicadores
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
