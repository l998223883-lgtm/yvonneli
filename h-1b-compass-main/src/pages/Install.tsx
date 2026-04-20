import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CheckCircle, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src="/pwa-192x192.png" alt="Merry Go Park" className="w-20 h-20 rounded-2xl mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Merry Go Park</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              安装到手机桌面，随时使用
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="text-center space-y-3">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                <p className="font-semibold text-lg">已安装！</p>
                <p className="text-sm text-muted-foreground">
                  App 已添加到您的主屏幕
                </p>
                <Button onClick={() => navigate('/')} className="w-full">
                  打开应用
                </Button>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  iOS 设备请按以下步骤安装：
                </p>
                <div className="space-y-3">
                  <Step num={1} icon={<Share className="h-4 w-4" />} text='点击 Safari 底部的 "分享" 按钮' />
                  <Step num={2} icon={<Download className="h-4 w-4" />} text='选择 "添加到主屏幕"' />
                  <Step num={3} icon={<CheckCircle className="h-4 w-4" />} text='点击 "添加" 确认' />
                </div>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full gap-2" size="lg">
                <Download className="h-5 w-5" />
                安装到主屏幕
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  在浏览器菜单中选择 "安装应用" 或 "添加到主屏幕"
                </p>
                <div className="space-y-3">
                  <Step num={1} icon={<Smartphone className="h-4 w-4" />} text="打开浏览器菜单（右上角三个点）" />
                  <Step num={2} icon={<Download className="h-4 w-4" />} text='选择 "安装应用" 或 "添加到主屏幕"' />
                  <Step num={3} icon={<CheckCircle className="h-4 w-4" />} text="确认安装" />
                </div>
              </div>
            )}

            <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-muted-foreground">
              继续使用网页版
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Step({ num, icon, text }: { num: number; icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
        {num}
      </div>
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
}
