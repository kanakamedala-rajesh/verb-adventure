declare module 'next-pwa' {
    import { NextConfig } from 'next';

    function withPWAInit(
        config: {
            dest?: string;
            disable?: boolean;
            register?: boolean;
            scope?: string;
            sw?: string;
            cacheOnFrontEndNav?: boolean;
            reloadOnOnline?: boolean;
            subdomainPrefix?: string;
            fallbacks?: {
                document?: string;
                image?: string;
                audio?: string;
                video?: string;
                font?: string;
            };
            publicExcludes?: string[];
            buildExcludes?: string[];
            cacheStartUrl?: boolean;
            dynamicStartUrl?: boolean;
            dynamicStartUrlRedirect?: string;
            skipWaiting?: boolean;
            clientsClaim?: boolean;
            runtimeCaching?: unknown[];
            customWorkerDir?: string;
        }
    ): (config: NextConfig) => NextConfig;

    export default withPWAInit;
}
