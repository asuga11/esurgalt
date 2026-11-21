import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { NavLink } from "react-router-dom";

export default function NavItem({ label, items, active }) {
  return (
    <Menu>
      <MenuButton type="button" className="app-nav-link group" data-current={active || undefined}>
        {label}
        <ChevronDownIcon aria-hidden="true" className="size-4 transition-transform group-data-open:rotate-180" />
      </MenuButton>
      <MenuItems anchor="bottom start" className="app-panel z-40 min-w-52 p-2 outline-none [--anchor-gap:0.5rem]">
        {items.map(({ label: itemLabel, to }) => (
          <MenuItem key={to}>
            <NavLink to={to} className="app-nav-link">{itemLabel}</NavLink>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
