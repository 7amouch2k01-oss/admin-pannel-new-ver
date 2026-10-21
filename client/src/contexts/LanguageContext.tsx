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

    // ── Analytics Page ────────────────────────────────────────────────────────
    "analytics.title": "Platform Financials & Growth",
    "analytics.subtitle": "Live financial ledger — gross revenue, refunds, creator commissions, brand payouts, and true platform profit.",
    "analytics.previewDemo": "Preview Demo Data",
    "analytics.exitDemo": "Exit Demo Data",
    "analytics.demoModeActive": "Demo Preview Mode",

    // Row 1 Financial KPIs
    "analytics.kpi.gross": "Gross Order Volume",
    "analytics.kpi.grossSub": "Total incoming transaction value",
    "analytics.kpi.refunds": "Total Money Refunded",
    "analytics.kpi.refundsCount": "refunds",
    "analytics.kpi.claimsOpen": "open claim(s)",
    "analytics.kpi.commissions": "All Commissions Disbursed",
    "analytics.kpi.commissionsPending": "pending payout",
    "analytics.kpi.paidOut": "paid out",
    "analytics.kpi.netGain": "Retained Net Gain",
    "analytics.kpi.netGainSub": "Gross − refunds − creator payouts − brand payouts",

    // Row 2 Operational KPIs
    "analytics.kpi.orders": "Orders",
    "analytics.kpi.ordersSub": "total placed",
    "analytics.kpi.avgOrder": "Avg Order",
    "analytics.kpi.avgOrderSub": "per transaction",
    "analytics.kpi.users": "Users",
    "analytics.kpi.usersSub": "registered accounts",
    "analytics.kpi.payoutRate": "Payout Rate",
    "analytics.kpi.payoutRateSub": "of gross to payees",
    "analytics.kpi.refundRate": "Refund Rate",
    "analytics.kpi.refundRateSub": "of gross refunded",
    "analytics.kpi.pendingPayouts": "Pending Payouts",
    "analytics.kpi.pendingPayoutsSub": "awaiting approval",

    // Charts Row 1
    "analytics.chart1.title": "Market Flow & Sales Curve",
    "analytics.chart1.badge": "Live Ledger",
    "analytics.chart1.desc": "Gross transaction volume vs retained net capital (TND)",
    "analytics.chart1.all": "All Curves",
    "analytics.chart1.gross": "Gross",
    "analytics.chart1.net": "Net Only",
    "analytics.chart1.ath": "ATH",
    "analytics.chart1.atl": "ATL",
    "analytics.chart1.orders": "Orders",
    "analytics.chart1.grossLegend": "Gross Sales (TND)",
    "analytics.chart1.netLegend": "Net Revenue (TND)",
    "analytics.chart1.refundsLegend": "Refunds (TND)",

    "analytics.chart2.title": "Adoption & Styler Accumulation",
    "analytics.chart2.badge": "Network Growth",
    "analytics.chart2.desc": "Cumulative accounts & monthly onboarding volume bars",
    "analytics.chart2.both": "Both (Curve+Vol)",
    "analytics.chart2.curve": "Curve",
    "analytics.chart2.inflow": "Inflow Vol",
    "analytics.chart2.accounts": "Accounts",
    "analytics.chart2.inflowSub": "new",
    "analytics.chart2.brands": "Brands",
    "analytics.chart2.stylers": "Stylers",
    "analytics.chart2.totalLegend": "Total Accounts",
    "analytics.chart2.inflowLegend": "Monthly Inflow (Volume)",

    // Charts Row 2
    "analytics.chart3.title": "Monthly Order Volume",
    "analytics.chart3.desc": "Number of orders placed per month",
    "analytics.chart3.legend": "Orders",
    "analytics.chart4.title": "Withdrawal Request Status",
    "analytics.chart4.desc": "All-time breakdown of payout requests by resolution status",
    "analytics.chart4.total": "Total",

    // Commission Deep Dive
    "analytics.comm.title": "Commission Deep-Dive",
    "analytics.comm.desc": "Detailed breakdown of outgoing payouts by recipient type",
    "analytics.comm.selectUser": "👤 Creator (User) Commissions",
    "analytics.comm.selectBrand": "🏷️ Brand Partner Payouts",
    "analytics.comm.labelUser": "Creator (User) Commissions",
    "analytics.comm.labelBrand": "Brand Partner Payouts",
    "analytics.comm.totalDisbursed": "Total Disbursed",
    "analytics.comm.pendingApproved": "Pending / Approved",
    "analytics.comm.totalRequests": "Total Requests",
    "analytics.comm.avgPayout": "Avg Payout",
    "analytics.comm.completedPayouts": "completed payouts",
    "analytics.comm.awaitingRequests": "requests awaiting",
    "analytics.comm.rejected": "rejected",
    "analytics.comm.perCompleted": "per completed request",
    "analytics.comm.recentLog": "Requests Log",
    "analytics.comm.recentDesc": "Latest 10 payout requests for this category",
    "analytics.comm.thRequester": "Requester",
    "analytics.comm.thAmount": "Amount",
    "analytics.comm.thMethod": "Method",
    "analytics.comm.thStatus": "Status",
    "analytics.comm.thDate": "Date",
    "analytics.comm.noRequests": "No withdrawal requests found.",

    // Revenue Waterfall
    "analytics.waterfall.title": "Revenue Waterfall",
    "analytics.waterfall.desc": "Step-by-step breakdown from gross revenue to true platform profit",
    "analytics.waterfall.gross": "Gross Order Volume",
    "analytics.waterfall.refunds": "Customer Refunds",
    "analytics.waterfall.userComm": "Creator Commissions Paid",
    "analytics.waterfall.brandComm": "Brand Partner Payouts Paid",
    "analytics.waterfall.netProfit": "Net Platform Profit",
    // Overview Page
    "overview.hubBadge": "Master Control Hub",
    "overview.title": "Styly Executive Overview",
    "overview.subtitle": "Real-time snapshot and quick navigation across all core operational modules.",
    "overview.usersTitle": "Users Management",
    "overview.usersDesc": "View creator grades, roles & access",
    "overview.usersSub": "Registered Creators & Shoppers",
    "overview.postsTitle": "Posts & Content",
    "overview.postsDesc": "Moderate outfits & engagement analytics",
    "overview.postsSub": "Live Feed Outfits",
    "overview.ordersTitle": "Orders & Shipments",
    "overview.ordersDesc": "Multi-brand split dispatch & delivery proof",
    "overview.ordersSub": "Placed Orders",
    "overview.analyticsTitle": "Platform Analytics",
    "overview.analyticsDesc": "Financial overview, revenue & gains",
    "overview.analyticsSub": "Net Gain",
    "overview.brandsTitle": "Brands Management",
    "overview.brandsDesc": "Verify brand stores & manage partners",
    "overview.brandsSub": "Active Designer Brands",
    "overview.locked": "Locked",
    "overview.lockedDesc": "Requires elevated staff permissions",
    "overview.salesTitle": "Gross Platform Sales",
    "overview.salesSub": "All completed consumer orders",
    "overview.refundsTitle": "Processed Refunds",
    "overview.refundsReturned": "returned",
    "overview.refundsClaims": "claim(s) open",
    "overview.commPaidTitle": "Commissions Paid",
    "overview.commPending": "pending",
    "overview.netGainTitle": "Net Platform Revenue",
    "overview.netGainSub": "Retained platform revenue",
    "overview.activityTitle": "Live Activity Stream",
    "overview.activityDesc": "Real-time operational events across all brands, orders, and users",
    "overview.activitySynced": "Live Synced",
    "overview.activityEmpty": "No recent activity logged yet.",

    // Users Page
    "users.title": "Users & Staff Management",
    "users.subtitle": "Segmented directory for shoppers, staff permissions, and creator commission disbursements.",
    "users.tabApp": "App Users",
    "users.tabTeam": "Styly Members",
    "users.tabWithdrawals": "Withdrawal Requests",
    "users.searchPlaceholder": "Search by name, email or ID...",
    "users.totalUsers": "Total Users",
    "users.shoppers": "Shoppers",
    "users.creators": "Creators & Stylers",
    "users.staff": "Staff Admins",
    "users.pendingPayouts": "Pending Payouts",
    "users.thUser": "User",
    "users.thGrade": "Grade / Role",
    "users.thPoints": "Style Points",
    "users.thStatus": "Status",
    "users.thJoined": "Joined",
    "users.thActions": "Actions",
    "users.roleShopper": "Shopper",
    "users.roleCreator": "Creator",
    "users.roleBrand": "Brand",
    "users.roleAdmin": "Admin",
    "users.managePermissions": "Manage Permissions",

    // Orders Page
    "orders.title": "Orders & Shipment Hub",
    "orders.subtitle": "Multi-brand split fulfillment, carrier tracking & live delivery status.",
    "orders.searchPlaceholder": "Search orders by customer or ID...",
    "orders.allStatuses": "All Statuses",
    "orders.statusPending": "Pending",
    "orders.statusProcessing": "Processing",
    "orders.statusShipped": "Shipped",
    "orders.statusDelivered": "Delivered",
    "orders.statusRefunded": "Refunded",
    "orders.statusCanceled": "Canceled",
    "orders.thOrder": "Order ID",
    "orders.thCustomer": "Customer",
    "orders.thBrands": "Brands & Items",
    "orders.thTotal": "Total (TND)",
    "orders.thStatus": "Order Status",
    "orders.thShipment": "Fulfillment",
    "orders.thDate": "Date",
    "orders.viewDetails": "View Details",

    // Brands Page
    "brands.title": "Brands Management",
    "brands.subtitle": "Manage partner brands, review verification requests, and update store statuses.",
    "brands.searchPlaceholder": "Search brand name, email...",
    "brands.allBrands": "All Brands",
    "brands.activeBrands": "Active Brands",
    "brands.pendingReview": "Pending Review",
    "brands.thBrand": "Brand",
    "brands.thCategory": "Category",
    "brands.thProducts": "Products",
    "brands.thVerification": "Verification",
    "brands.thCommission": "Commission Rate",
    "brands.verifyBtn": "Verify Brand",
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

    // ── Analytics Page ────────────────────────────────────────────────────────
    "analytics.title": "Finances & Croissance de la Plateforme",
    "analytics.subtitle": "Grand livre financier en direct — revenus bruts, remboursements, commissions créateurs, paiements marques et bénéfice net.",
    "analytics.previewDemo": "Aperçu Données Démo",
    "analytics.exitDemo": "Quitter Mode Démo",
    "analytics.demoModeActive": "Mode Démo Actif",

    // Row 1 Financial KPIs
    "analytics.kpi.gross": "Volume Brut des Commandes",
    "analytics.kpi.grossSub": "Valeur totale des transactions entrantes",
    "analytics.kpi.refunds": "Total des Remboursements",
    "analytics.kpi.refundsCount": "remboursements",
    "analytics.kpi.claimsOpen": "réclamation(s) ouverte(s)",
    "analytics.kpi.commissions": "Commissions Décaissées",
    "analytics.kpi.commissionsPending": "en attente de virement",
    "analytics.kpi.paidOut": "payés",
    "analytics.kpi.netGain": "Gain Net Conservé",
    "analytics.kpi.netGainSub": "Ventes brutes − remboursements − créateurs − marques",

    // Row 2 Operational KPIs
    "analytics.kpi.orders": "Commandes",
    "analytics.kpi.ordersSub": "total passées",
    "analytics.kpi.avgOrder": "Panier Moyen",
    "analytics.kpi.avgOrderSub": "par transaction",
    "analytics.kpi.users": "Utilisateurs",
    "analytics.kpi.usersSub": "comptes enregistrés",
    "analytics.kpi.payoutRate": "Taux de Décaissement",
    "analytics.kpi.payoutRateSub": "du brut reversé aux partenaires",
    "analytics.kpi.refundRate": "Taux de Retour",
    "analytics.kpi.refundRateSub": "du brut remboursé",
    "analytics.kpi.pendingPayouts": "Virements en Attente",
    "analytics.kpi.pendingPayoutsSub": "en attente de validation",

    // Charts Row 1
    "analytics.chart1.title": "Flux de Marché & Courbe des Ventes",
    "analytics.chart1.badge": "Registre en Direct",
    "analytics.chart1.desc": "Volume brut des transactions vs capital net conservé (TND)",
    "analytics.chart1.all": "Toutes les Courbes",
    "analytics.chart1.gross": "Brut",
    "analytics.chart1.net": "Net Seul",
    "analytics.chart1.ath": "Record",
    "analytics.chart1.atl": "Plancher",
    "analytics.chart1.orders": "Commandes",
    "analytics.chart1.grossLegend": "Ventes Brutes (TND)",
    "analytics.chart1.netLegend": "Revenu Net Conservé (TND)",
    "analytics.chart1.refundsLegend": "Remboursements (TND)",

    "analytics.chart2.title": "Courbe d'Adoption & Accumulation Stylers",
    "analytics.chart2.badge": "Croissance Réseau",
    "analytics.chart2.desc": "Comptes cumulés & volume mensuel des nouvelles inscriptions",
    "analytics.chart2.both": "Les Deux (Courbe+Vol)",
    "analytics.chart2.curve": "Courbe",
    "analytics.chart2.inflow": "Vol Influx",
    "analytics.chart2.accounts": "Comptes",
    "analytics.chart2.inflowSub": "nouveaux",
    "analytics.chart2.brands": "Marques",
    "analytics.chart2.stylers": "Créateurs",
    "analytics.chart2.totalLegend": "Comptes Totaux",
    "analytics.chart2.inflowLegend": "Nouvelles Inscriptions (Volume)",

    // Charts Row 2
    "analytics.chart3.title": "Volume Mensuel des Commandes",
    "analytics.chart3.desc": "Nombre de commandes passées par mois",
    "analytics.chart3.legend": "Commandes",
    "analytics.chart4.title": "Statut des Demandes de Virement",
    "analytics.chart4.desc": "Répartition globale des demandes de paiement par statut",
    "analytics.chart4.total": "Total",

    // Commission Deep Dive
    "analytics.comm.title": "Analyse Approfondie des Commissions",
    "analytics.comm.desc": "Ventilation détaillée des décaissements selon le type de bénéficiaire",
    "analytics.comm.selectUser": "👤 Commissions Créateurs (Utilisateurs)",
    "analytics.comm.selectBrand": "🏷️ Virements Marques Partenaires",
    "analytics.comm.labelUser": "Commissions Créateurs (Utilisateurs)",
    "analytics.comm.labelBrand": "Virements Marques Partenaires",
    "analytics.comm.totalDisbursed": "Total Décaissé",
    "analytics.comm.pendingApproved": "En Attente / Approuvé",
    "analytics.comm.totalRequests": "Total des Demandes",
    "analytics.comm.avgPayout": "Virement Moyen",
    "analytics.comm.completedPayouts": "virements effectués",
    "analytics.comm.awaitingRequests": "demandes en attente",
    "analytics.comm.rejected": "rejetées",
    "analytics.comm.perCompleted": "par demande validée",
    "analytics.comm.recentLog": "Journal des Demandes",
    "analytics.comm.recentDesc": "10 dernières demandes de paiement pour cette catégorie",
    "analytics.comm.thRequester": "Bénéficiaire",
    "analytics.comm.thAmount": "Montant",
    "analytics.comm.thMethod": "Méthode",
    "analytics.comm.thStatus": "Statut",
    "analytics.comm.thDate": "Date",
    "analytics.comm.noRequests": "Aucune demande de virement trouvée.",

    // Revenue Waterfall
    "analytics.waterfall.title": "Cascade des Revenus & Rentabilité",
    "analytics.waterfall.desc": "Décomposition étape par étape du revenu brut jusqu'au bénéfice réel",
    "analytics.waterfall.gross": "Volume Brut des Commandes",
    "analytics.waterfall.refunds": "Remboursements Clients",
    "analytics.waterfall.userComm": "Commissions Créateurs Payées",
    "analytics.waterfall.brandComm": "Virements Marques Partenaires Payés",
    "analytics.waterfall.netProfit": "Bénéfice Net Réel de la Plateforme",
    // Overview Page
    "overview.hubBadge": "Centre de Contrôle Principal",
    "overview.title": "Aperçu Exécutif Styly",
    "overview.subtitle": "Instantané en temps réel et navigation rapide à travers tous les modules opérationnels.",
    "overview.usersTitle": "Gestion des Utilisateurs",
    "overview.usersDesc": "Consulter les grades de créateur, rôles et accès",
    "overview.usersSub": "Créateurs & Acheteurs Enregistrés",
    "overview.postsTitle": "Publications & Contenu",
    "overview.postsDesc": "Modérer les tenues & statistiques d'engagement",
    "overview.postsSub": "Tenues du Fil Actif",
    "overview.ordersTitle": "Commandes & Expéditions",
    "overview.ordersDesc": "Dispatch multi-marques & suivi de livraison",
    "overview.ordersSub": "Commandes Passées",
    "overview.analyticsTitle": "Statistiques & Finance",
    "overview.analyticsDesc": "Aperçu financier, chiffre d'affaires & gains",
    "overview.analyticsSub": "Gain Net",
    "overview.brandsTitle": "Gestion des Marques",
    "overview.brandsDesc": "Vérifier les boutiques de marques & partenaires",
    "overview.brandsSub": "Marques Partenaires Actives",
    "overview.locked": "Verrouillé",
    "overview.lockedDesc": "Nécessite des permissions élevées",
    "overview.salesTitle": "Ventes Brutes Plateforme",
    "overview.salesSub": "Toutes les commandes acheteurs finalisées",
    "overview.refundsTitle": "Remboursements Traités",
    "overview.refundsReturned": "retournés",
    "overview.refundsClaims": "réclamation(s) ouverte(s)",
    "overview.commPaidTitle": "Commissions Payées",
    "overview.commPending": "en attente",
    "overview.netGainTitle": "Revenu Net Plateforme",
    "overview.netGainSub": "Revenu conservé par la plateforme",
    "overview.activityTitle": "Flux d'Activité en Direct",
    "overview.activityDesc": "Événements opérationnels en temps réel sur toutes les marques, commandes et utilisateurs",
    "overview.activitySynced": "Synchronisé en Direct",
    "overview.activityEmpty": "Aucune activité récente enregistrée pour l'instant.",

    // Users Page
    "users.title": "Gestion des Utilisateurs & Équipe",
    "users.subtitle": "Répertoire segmenté pour les acheteurs, permissions du personnel et commissions créateurs.",
    "users.tabApp": "Utilisateurs App",
    "users.tabTeam": "Équipe Styly",
    "users.tabWithdrawals": "Demandes de Retrait",
    "users.searchPlaceholder": "Rechercher par nom, e-mail ou identifiant...",
    "users.totalUsers": "Total Utilisateurs",
    "users.shoppers": "Acheteurs",
    "users.creators": "Créateurs & Stylers",
    "users.staff": "Administrateurs",
    "users.pendingPayouts": "Virements en Attente",
    "users.thUser": "Utilisateur",
    "users.thGrade": "Grade / Rôle",
    "users.thPoints": "Style Points",
    "users.thStatus": "Statut",
    "users.thJoined": "Inscrit le",
    "users.thActions": "Actions",
    "users.roleShopper": "Acheteur",
    "users.roleCreator": "Créateur",
    "users.roleBrand": "Marque",
    "users.roleAdmin": "Admin",
    "users.managePermissions": "Gérer les Permissions",

    // Orders Page
    "orders.title": "Centre des Commandes & Expéditions",
    "orders.subtitle": "Traitement multi-marques, suivi transporteur & statut de livraison en direct.",
    "orders.searchPlaceholder": "Rechercher une commande par client ou ID...",
    "orders.allStatuses": "Tous les Statuts",
    "orders.statusPending": "En attente",
    "orders.statusProcessing": "En préparation",
    "orders.statusShipped": "Expédiée",
    "orders.statusDelivered": "Livrée",
    "orders.statusRefunded": "Remboursée",
    "orders.statusCanceled": "Annulée",
    "orders.thOrder": "N° Commande",
    "orders.thCustomer": "Client",
    "orders.thBrands": "Marques & Articles",
    "orders.thTotal": "Total (TND)",
    "orders.thStatus": "Statut Commande",
    "orders.thShipment": "Expédition",
    "orders.thDate": "Date",
    "orders.viewDetails": "Voir Détails",

    // Brands Page
    "brands.title": "Gestion des Marques Partenaires",
    "brands.subtitle": "Gérez les marques créatrices, validez les demandes de certification et mettez à jour les boutiques.",
    "brands.searchPlaceholder": "Rechercher par nom de marque, email...",
    "brands.allBrands": "Toutes les Marques",
    "brands.activeBrands": "Marques Actives",
    "brands.pendingReview": "En Attente de Revue",
    "brands.thBrand": "Marque",
    "brands.thCategory": "Catégorie",
    "brands.thProducts": "Produits",
    "brands.thVerification": "Certification",
    "brands.thCommission": "Taux Commission",
    "brands.verifyBtn": "Certifier la Marque",
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
