"""Enum de roles de usuário"""
import enum


class BaseRole(str, enum.Enum):
    """Roles base dos usuários no sistema"""
    OWNER = 'owner'
    MANAGER = 'manager'
    FINANCIAL = 'financial'
    OPERATIONAL = 'operational'
    SYSTEM_ADMIN = 'system_admin'

