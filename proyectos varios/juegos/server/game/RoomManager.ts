// server/game/RoomManager.ts
import { Player } from "./Player";

interface Room {
  id: string;
  players: Map<string, Player>; // socketId -> Player
}

/**
 * Simple in‑memory manager for multiplayer rooms.
 * For a production game you would replace this with a persistent store
 * (Redis, Firestore, etc.) but for a prototype it is sufficient.
 */
export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /** Get or create a room */
  private getRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = { id: roomId, players: new Map() };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  /** Add a player to a room and return the newly created Player */
  addPlayer(roomId: string, socketId: string): Player {
    const room = this.getRoom(roomId);
    const player = new Player(socketId);
    room.players.set(socketId, player);
    return player;
  }

  /** Remove a player from a room */
  removePlayer(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players.delete(socketId);
    // clean up empty rooms
    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  /** Update a player state (lives / level) */
  updatePlayerState(roomId: string, socketId: string, data: Partial<Pick<Player, "lives" | "level">>): Player {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error(`Room ${roomId} not found`);
    const player = room.players.get(socketId);
    if (!player) throw new Error(`Player ${socketId} not found in room ${roomId}`);
    if (data.lives !== undefined) player.lives = data.lives;
    if (data.level !== undefined) player.level = data.level;
    return player;
  }

  /** Find the room id that contains a given socket */
  getRoomIdBySocket(socketId: string): string | undefined {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.has(socketId)) return roomId;
    }
    return undefined;
  }
}
