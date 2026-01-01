"use client";

import Listings from "../page";
import { useParams } from "next/navigation";

export default function UserListingsPage() {
  const { username } = useParams();

  return <Listings username={username as string} />;
}
