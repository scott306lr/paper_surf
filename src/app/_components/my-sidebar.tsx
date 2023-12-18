"use client";

import { Sidebar } from "flowbite-react";
import { type IconType } from "react-icons";
import { HiChartPie, HiHome, HiInbox, HiViewBoards } from "react-icons/hi";

export function MySidebar() {
  return (
    <Sidebar aria-label="Default sidebar example">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/" icon={HiHome as IconType}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/default" icon={HiChartPie as IconType}>
            Default Page
          </Sidebar.Item>
          <Sidebar.Item href="/testUrl" icon={HiInbox as IconType} label="3">
            TestUrl Page
          </Sidebar.Item>
          <Sidebar.Item
            href="#"
            icon={HiViewBoards as IconType}
            label="Pro"
            labelColor="dark"
          >
            LR Test Page
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
