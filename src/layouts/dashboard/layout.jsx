import { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify, Logo } from "@/components/core";
import { paths } from "@/paths";
import { usePathname } from "@/routes/hooks/use-pathname";
import { useRouter } from "@/routes/hooks/use-router";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
	{ title: "Overview", path: paths.dashboard.root, icon: "solar:chart-bold-duotone" },
	{ title: "Contratos", path: paths.dashboard.contratos, icon: "solar:document-bold-duotone" },
	{ title: "Alertas IA", path: paths.dashboard.alertas, icon: "solar:danger-triangle-bold-duotone" },
];

export function DashboardLayout({ children }) {
	const { user, logout } = useAuthContext();
	const router = useRouter();
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);

	const handleLogout = async () => {
		try {
			await logout();
			router.replace(paths.landing);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const drawerContent = (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<Box sx={{ p: 2.5 }}>
				<Logo variant="dark" />
			</Box>

			<Divider />

			<List sx={{ px: 1.5, py: 2, flex: 1 }}>
				{NAV_ITEMS.map((item) => {
					const active = pathname === item.path;
					return (
						<ListItemButton
							key={item.path}
							onClick={() => {
								router.push(item.path);
								setMobileOpen(false);
							}}
							sx={{
								borderRadius: 1.5,
								mb: 0.5,
								color: active ? "primary.main" : "text.secondary",
							bgcolor: active ? "rgba(46, 59, 78, 0.08)" : "transparent",
							"&:hover": { bgcolor: "rgba(46, 59, 78, 0.06)" },
							}}
						>
							<ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
								<Iconify icon={item.icon} width={22} />
							</ListItemIcon>
							<ListItemText
								primary={item.title}
								primaryTypographyProps={{ variant: "body2", fontWeight: active ? 600 : 400 }}
							/>
						</ListItemButton>
					);
				})}
			</List>

			<Divider />

			<Box sx={{ p: 2 }}>
				<ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5, color: "error.main" }}>
					<ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
						<Iconify icon="solar:logout-2-bold-duotone" width={22} />
					</ListItemIcon>
					<ListItemText primary="Cerrar sesión" primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
				</ListItemButton>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ display: "flex", minHeight: "100vh" }}>
			{/* Sidebar - desktop */}
			<Drawer
				variant="permanent"
				sx={{
					display: { xs: "none", md: "block" },
					width: DRAWER_WIDTH,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: DRAWER_WIDTH,
						boxSizing: "border-box",
						borderRight: "1px dashed",
						borderColor: "divider",
					},
				}}
			>
				{drawerContent}
			</Drawer>

			{/* Sidebar - mobile */}
			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				sx={{
					display: { xs: "block", md: "none" },
					"& .MuiDrawer-paper": { width: DRAWER_WIDTH },
				}}
			>
				{drawerContent}
			</Drawer>

			{/* Main content */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<AppBar
					position="sticky"
					color="inherit"
					elevation={0}
					sx={{ borderBottom: "1px dashed", borderColor: "divider", bgcolor: "background.default" }}
				>
					<Toolbar>
						<IconButton
							onClick={() => setMobileOpen(true)}
							sx={{ mr: 1, display: { md: "none" } }}
						>
							<Iconify icon="solar:hamburger-menu-bold-duotone" />
						</IconButton>

						<Box sx={{ flex: 1 }} />

						<Stack direction="row" alignItems="center" spacing={1}>
							<Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
								{user?.email}
							</Typography>

							<IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
								<Avatar
									sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}
								>
									{user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
								</Avatar>
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={!!anchorEl}
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
							>
								<MenuItem disabled>
									<Typography variant="body2">{user?.email}</Typography>
								</MenuItem>
								<Divider />
								<MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
									<Iconify icon="solar:logout-2-bold-duotone" width={20} sx={{ mr: 1 }} />
									Cerrar sesión
								</MenuItem>
							</Menu>
						</Stack>
					</Toolbar>
				</AppBar>

				<Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
					{children}
				</Box>
			</Box>
		</Box>
	);
}
