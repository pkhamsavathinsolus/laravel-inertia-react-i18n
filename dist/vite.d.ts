export default function i18n(langPath?: string): {
    name: string;
    enforce: string;
    config(config: any): {
        define: {
            'process.env.LARAVEL_REACT_I18N_HAS_PHP': boolean;
        };
    };
    buildEnd: () => void;
    handleHotUpdate(ctx: any): void;
    configureServer(server: any): void;
};
