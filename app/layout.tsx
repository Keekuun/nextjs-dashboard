import "@/app/ui/global.css"

import {inter} from "@/app/ui/fonts"
import {PropsWithChildren} from "react";
import {Metadata, Viewport} from 'next';

const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "My Awesome PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: "summary",
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
};

export const viewport: Viewport = {
    themeColor: "#FFFFFF",
};
export default function RootLayout({children}: PropsWithChildren) {
    return (
        <html lang="en" dir="ltr">
        <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}
