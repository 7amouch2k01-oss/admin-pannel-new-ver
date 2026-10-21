import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.overview": "Overview",
    "nav.users": "Users",
    "nav.appUsers": "App Users",
    "nav.appUsersDesc": "Brands, Creators & Shoppers only",
    "nav.stylyMembers": "Styly Members",
    "nav.stylyMembersDesc": "Admins & team permissions",
    "nav.posts": "Posts",
    "nav.orders": "Orders",
    "nav.analytics": "Analytics",
    "nav.brands": "Brands",
    "nav.settings": "Settings",
    "nav.theme": "Theme",
    "nav.signout": "Sign out",
    "nav.accountTypes": "Account Types",

    // Common
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.verified": "Verified",
    "common.active": "Active",
    "common.pending": "Pending",
    "common.rejected": "Rejected",
    "common.approved": "Approved",
    "common.completed": "Completed",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.enabled": "Enabled",
    "common.disabled": "Disabled",
    "common.close": "Close",

    // Settings Header & Tabs
    "settings.title": "Platform Settings & Security",
    "settings.subtitle": "Manage administrator credentials, interface language, system automation, and advanced platform parameters.",
    "settings.tab.simple": "General Settings",
    "settings.tab.advanced": "Advanced Platform Settings",
    "settings.tab.advancedRestricted": "Advanced Settings (Restricted)",

    // Language Selector
    "settings.language.title": "Console Language",
    "settings.language.desc": "Choose your preferred administrative language. The entire dashboard will adapt instantly.",
    "settings.language.en": "English 🇬🇧",
    "settings.language.fr": "Français 🇫🇷",

    // Profile Card
    "settings.profile.title": "Admin Profile & Access",
    "settings.profile.desc": "Your authenticated identity and administrative security role",
    "settings.profile.name": "Admin Display Name",
    "settings.profile.email": "Email Address",
    "settings.profile.role": "Role Clearance",
    "settings.profile.ownerBadge": "PLATFORM OWNER",
    "settings.profile.coOwnerBadge": "CO-OWNER",
    "settings.profile.adminBadge": "ADMIN STAFF",
    "settings.profile.ownerDesc": "Full root access over Users, Brands, Finances, Settings & Security",
    "settings.profile.adminDesc": "Standard operational administrator privileges",
    "settings.profile.saveBtn": "Save Profile",

    // Change Password
    "settings.password.title": "Change Password",
    "settings.password.desc": "Update your console account access password",
    "settings.password.current": "Current Password",
    "settings.password.new": "New Password",
    "settings.password.confirm": "Confirm New Password",
    "settings.password.updateBtn": "Update Password",
    "settings.password.minChars": "At least 6 characters required",
    "settings.password.matchError": "Passwords do not match",
    "settings.password.success": "Password updated successfully!",

    // Simple / Personal Notifications
    "settings.notifications.title": "Personal Notification Alerts",
    "settings.notifications.desc": "Manage personal email triggers and operational digests",
    "settings.notifications.orders": "Email Order Alerts",
    "settings.notifications.ordersDesc": "Notify on high-value multi-brand orders",
    "settings.notifications.reports": "Weekly Performance Digest",
    "settings.notifications.reportsDesc": "Receive summary of revenue and creator growth",

    // Session
    "settings.session.title": "Sign Out of Admin Console",
    "settings.session.desc": "Safely terminate your active administrative session",
    "settings.session.btn": "Log Out",

    // Advanced Settings Section
    "settings.adv.banner.title": "Restricted High-Level Control Panel",
    "settings.adv.banner.desc": "You have full clearance to configure platform monetary rules, team permissions, security guardrails, and automated engines.",
    "settings.adv.locked.title": "Advanced Settings Restricted",
    "settings.adv.locked.desc": "These controls are locked to Platform Owners, Co-Owners, and admins with granted permission. Contact Amine (Owner) to request access.",

    // Advanced: Admin Delegation
    "settings.adv.delegation.title": "Admin Permissions & Delegation",
    "settings.adv.delegation.desc": "Grant or revoke Advanced Platform Settings access for staff administrators.",
    "settings.adv.delegation.tableAdmin": "Administrator",
    "settings.adv.delegation.tableRole": "Role / Rank",
    "settings.adv.delegation.tableAccess": "Advanced Settings Access",
    "settings.adv.delegation.granted": "Granted",
    "settings.adv.delegation.grantBtn": "Grant Access",
    "settings.adv.delegation.revokeBtn": "Revoke Access",
    "settings.adv.delegation.ownerImmune": "Root Owner (Permanent)",

    // Advanced: Platform Controls
    "settings.adv.platform.title": "Platform Operations & Maintenance",
    "settings.adv.platform.desc": "Global site availability and brand approval automation",
    "settings.adv.maintenance": "Emergency Maintenance Mode",
    "settings.adv.maintenanceDesc": "Locks mobile application checkouts for database upgrades",
    "settings.adv.allowRegistrations": "Allow Public Registrations",
    "settings.adv.allowRegistrationsDesc": "Permit new shoppers and creators to sign up",
    "settings.adv.autoApproveBrands": "Auto-Approve Partner Brands",
    "settings.adv.autoApproveBrandsDesc": "Skip manual compliance review for verified fashion stores",
    "settings.adv.autoFlagPosts": "Auto-Flag Incomplete Looks",
    "settings.adv.autoFlagPostsDesc": "Automatically hide user posts with missing tagged products",
    "settings.adv.cancellationWindow": "Order Cancellation Window (Hours)",

    // Advanced: Financial & Commission Engine
    "settings.adv.finance.title": "Marketplace Financial Engine",
    "settings.adv.finance.desc": "Configure platform commissions, brand fees, and withdrawal rules",
    "settings.adv.creatorCommission": "Default Creator Commission Rate (%)",
    "settings.adv.brandFee": "Platform Brand Fee Take-Rate (%)",
    "settings.adv.minWithdrawal": "Minimum Payout Withdrawal (TND)",
    "settings.adv.payoutMode": "Withdrawal Processing Workflow",
    "settings.adv.payoutModeManual": "Manual Admin Approval (Recommended)",
    "settings.adv.payoutModeAuto": "Automatic Instant Payouts",

    // Advanced: Security & Safeguards
    "settings.adv.security.title": "Security & Infrastructure Safeguards",
    "settings.adv.security.desc": "Authentication hardening, brute-force mitigation, and webhooks",
    "settings.adv.enforce2FA": "Mandatory Two-Factor Auth (2FA)",
    "settings.adv.enforce2FADesc": "Require authenticator code for all console staff",
    "settings.adv.maxAttempts": "Max Failed Login Attempts",
    "settings.adv.webhook": "Slack / Discord Audit Webhook URL",

    // Advanced: AI & Innovation
    "settings.adv.ai.title": "AI & Innovation Feature Flags",
    "settings.adv.ai.desc": "Manage experimental Styly machine learning modules",
    "settings.adv.tryOn": "Styly AI Virtual Try-On Engine",
    "settings.adv.tryOnDesc": "Enable interactive 3D/AI outfit preview for shoppers",
    "settings.adv.autoTagging": "AI Smart Outfit Tagging",
    "settings.adv.autoTaggingDesc": "Auto-detect garments and suggest brand matches from photos",

    // Success & Toasts
    "settings.toast.saved": "Settings saved successfully ✅",
    "settings.toast.langChanged": "Language changed to English 🇬🇧",
    "settings.toast.accessGranted": "Advanced settings access granted to",
    "settings.toast.accessRevoked": "Advanced settings access revoked from",
  },
  fr: {
    // Navigation
    "nav.overview": "Aperçu",
    "nav.users": "Utilisateurs",
    "nav.appUsers": "Utilisateurs App",
    "nav.appUsersDesc": "Marques, Créateurs & Acheteurs uniquement",
    "nav.stylyMembers": "Équipe Styly",
    "nav.stylyMembersDesc": "Administrateurs & permissions d'équipe",
    "nav.posts": "Publications",
    "nav.orders": "Commandes",
    "nav.analytics": "Statistiques & Finance",
    "nav.brands": "Marques",
    "nav.settings": "Paramètres",
    "nav.theme": "Thème",
    "nav.signout": "Déconnexion",
    "nav.accountTypes": "Types de Comptes",

    // Common
    "common.save": "Enregistrer",
    "common.saving": "Enregistrement...",
    "common.cancel": "Annuler",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.search": "Rechercher",
    "common.loading": "Chargement...",
    "common.verified": "Vérifié",
    "common.active": "Actif",
    "common.pending": "En attente",
    "common.rejected": "Rejeté",
    "common.approved": "Approuvé",
    "common.completed": "Terminé",
    "common.status": "Statut",
    "common.actions": "Actions",
    "common.enabled": "Activé",
    "common.disabled": "Désactivé",
    "common.close": "Fermer",

    // Settings Header & Tabs
    "settings.title": "Paramètres de la Plateforme & Sécurité",
    "settings.subtitle": "Gérez vos identifiants d'administrateur, la langue de l'interface, l'automatisation système et les paramètres avancés.",
    "settings.tab.simple": "Paramètres Généraux",
    "settings.tab.advanced": "Paramètres Avancés de la Plateforme",
    "settings.tab.advancedRestricted": "Paramètres Avancés (Accès Restreint)",

    // Language Selector
    "settings.language.title": "Langue de la Console",
    "settings.language.desc": "Sélectionnez votre langue d'administration. L'intégralité du tableau de bord s'adaptera instantanément.",
    "settings.language.en": "English 🇬🇧",
    "settings.language.fr": "Français 🇫🇷",

    // Profile Card
    "settings.profile.title": "Profil Administrateur & Accès",
    "settings.profile.desc": "Votre identité authentifiée et votre niveau d'habilitation de sécurité",
    "settings.profile.name": "Nom d'Affichage Administrateur",
    "settings.profile.email": "Adresse E-mail",
    "settings.profile.role": "Habilitation de Sécurité",
    "settings.profile.ownerBadge": "PROPRIÉTAIRE PLATEFORME",
    "settings.profile.coOwnerBadge": "CO-PROPRIÉTAIRE",
    "settings.profile.adminBadge": "ADMINISTRATEUR",
    "settings.profile.ownerDesc": "Accès racine total sur Utilisateurs, Marques, Finances, Paramètres & Sécurité",
    "settings.profile.adminDesc": "Privilèges d'administration opérationnelle standard",
    "settings.profile.saveBtn": "Enregistrer le Profil",

    // Change Password
    "settings.password.title": "Modifier le Mot de Passe",
    "settings.password.desc": "Mettez à jour le mot de passe de votre compte console",
    "settings.password.current": "Mot de passe actuel",
    "settings.password.new": "Nouveau mot de passe",
    "settings.password.confirm": "Confirmer le nouveau mot de passe",
    "settings.password.updateBtn": "Mettre à jour le mot de passe",
    "settings.password.minChars": "Au moins 6 caractères requis",
    "settings.password.matchError": "Les mots de passe ne correspondent pas",
    "settings.password.success": "Mot de passe mis à jour avec succès !",

    // Simple / Personal Notifications
    "settings.notifications.title": "Alertes & Notifications Personnelles",
    "settings.notifications.desc": "Gérez vos notifications par e-mail et récapitulatifs d'activité",
    "settings.notifications.orders": "Alertes Nouvelles Commandes",
    "settings.notifications.ordersDesc": "Notification par e-mail lors de commandes multi-marques",
    "settings.notifications.reports": "Récapitulatif Hebdomadaire",
    "settings.notifications.reportsDesc": "Recevoir un résumé du chiffre d'affaires et de la croissance",

    // Session
    "settings.session.title": "Déconnexion de la Console",
    "settings.session.desc": "Mettre fin en toute sécurité à votre session administrative active",
    "settings.session.btn": "Se Déconnecter",

    // Advanced Settings Section
    "settings.adv.banner.title": "Panneau de Contrôle Avancé Restreint",
    "settings.adv.banner.desc": "Vous disposez des pleins pouvoirs pour configurer les règles financières, les permissions d'équipe, la sécurité et les moteurs automatisés.",
    "settings.adv.locked.title": "Paramètres Avancés Verrouillés",
    "settings.adv.locked.desc": "Ces contrôles sont réservés au Propriétaire, Co-Propriétaire et administrateurs autorisés. Contactez Amine (Propriétaire) pour demander l'accès.",

    // Advanced: Admin Delegation
    "settings.adv.delegation.title": "Délégation & Permissions Administrateur",
    "settings.adv.delegation.desc": "Accordez ou révoquez l'accès aux Paramètres Avancés pour les autres administrateurs de l'équipe.",
    "settings.adv.delegation.tableAdmin": "Administrateur",
    "settings.adv.delegation.tableRole": "Rôle / Rang",
    "settings.adv.delegation.tableAccess": "Accès Paramètres Avancés",
    "settings.adv.delegation.granted": "Autorisé",
    "settings.adv.delegation.grantBtn": "Accorder l'accès",
    "settings.adv.delegation.revokeBtn": "Révoquer l'accès",
    "settings.adv.delegation.ownerImmune": "Propriétaire Racine (Permanent)",

    // Advanced: Platform Controls
    "settings.adv.platform.title": "Opérations Plateforme & Maintenance",
    "settings.adv.platform.desc": "Disponibilité globale du service et automatisation de validation des marques",
    "settings.adv.maintenance": "Mode Maintenance d'Urgence",
    "settings.adv.maintenanceDesc": "Verrouille les commandes sur l'application mobile lors des mises à jour",
    "settings.adv.allowRegistrations": "Autoriser les Nouvelles Inscriptions",
    "settings.adv.allowRegistrationsDesc": "Permettre aux nouveaux clients et créateurs de créer un compte",
    "settings.adv.autoApproveBrands": "Validation Automatique des Marques Partenaires",
    "settings.adv.autoApproveBrandsDesc": "Activation instantanée sans revue manuelle pour les partenaires certifiés",
    "settings.adv.autoFlagPosts": "Signalement Automatique des Looks Incomplets",
    "settings.adv.autoFlagPostsDesc": "Masquer automatiquement les publications sans articles tagués",
    "settings.adv.cancellationWindow": "Délai d'Annulation de Commande (Heures)",

    // Advanced: Financial & Commission Engine
    "settings.adv.finance.title": "Moteur Financier & Commissions",
    "settings.adv.finance.desc": "Configurez les commissions créateurs, les frais marques et les règles de virement",
    "settings.adv.creatorCommission": "Taux de Commission Créateur par Défaut (%)",
    "settings.adv.brandFee": "Frais de Plateforme sur les Marques (%)",
    "settings.adv.minWithdrawal": "Seuil Minimum de Retrait (TND)",
    "settings.adv.payoutMode": "Traitement des Demandes de Retrait",
    "settings.adv.payoutModeManual": "Validation Manuelle par Admin (Recommandé)",
    "settings.adv.payoutModeAuto": "Virements Automatiques Instantanés",

    // Advanced: Security & Safeguards
    "settings.adv.security.title": "Sécurité & Infrastructure",
    "settings.adv.security.desc": "Durcissement d'authentification, protection anti brute-force et webhooks",
    "settings.adv.enforce2FA": "Authentification à Deux Facteurs (2FA) Obligatoire",
    "settings.adv.enforce2FADesc": "Exiger un code 2FA pour tous les membres de la console",
    "settings.adv.maxAttempts": "Tentatives Maximales de Connexion",
    "settings.adv.webhook": "URL de Webhook d'Audit (Slack / Discord)",

    // Advanced: AI & Innovation
    "settings.adv.ai.title": "Fonctionnalités IA & Innovation",
    "settings.adv.ai.desc": "Gérer les modules d'intelligence artificielle de Styly",
    "settings.adv.tryOn": "Moteur d'Essayage Virtuel IA Styly",
    "settings.adv.tryOnDesc": "Activer la prévisualisation 3D/IA des tenues pour les acheteurs",
    "settings.adv.autoTagging": "Tagging Intelligent IA des Vêtements",
    "settings.adv.autoTaggingDesc": "Détecter automatiquement les articles et suggérer les marques sur les photos",

    // Success & Toasts
    "settings.toast.saved": "Paramètres enregistrés avec succès ✅",
    "settings.toast.langChanged": "Langue modifiée en Français 🇫🇷",
    "settings.toast.accessGranted": "Accès aux paramètres avancés accordé à",
    "settings.toast.accessRevoked": "Accès aux paramètres avancés révoqué pour",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "styly_admin_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") return saved;
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    return translations[language][key] ?? fallback ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
