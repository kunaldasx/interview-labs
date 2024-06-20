"""WebSocket connection manager — tracks active connections per interview."""
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Singleton tracking active WebSocket connections per interview."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._connections: dict[int, WebSocket] = {}
        return cls._instance

    async def connect(self, interview_id: int, websocket: WebSocket):
        if interview_id in self._connections:
            old_ws = self._connections[interview_id]
            logger.info(f"Replacing existing WS connection for interview {interview_id}")
            try:
                await old_ws.close(code=1001, reason="Replaced by new connection")
            except Exception:
                pass
        self._connections[interview_id] = websocket
        logger.info(f"WS connected: interview={interview_id} (active={self.active_count})")

    def disconnect(self, interview_id: int):
        self._connections.pop(interview_id, None)
        logger.info(f"WS disconnected: interview={interview_id} (active={self.active_count})")

    def get(self, interview_id: int) -> WebSocket | None:
        return self._connections.get(interview_id)

    def is_connected(self, interview_id: int) -> bool:
        return interview_id in self._connections

    @property
    def active_count(self) -> int:
        return len(self._connections)


ws_manager = ConnectionManager()
