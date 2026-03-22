import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Reserva } from '../../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_KEY
    );
  }

  async cargar(): Promise<Reserva[]> {
    const { data, error } = await this.supabase
      .from('reservas')
      .select('*')
      .order('dia', { ascending: true });

    if (error) throw error;
    return data as Reserva[];
  }

  async guardar(reserva: Omit<Reserva, 'id'>): Promise<Reserva> {
    const { data, error } = await this.supabase
      .from('reservas')
      .insert(reserva)
      .select()
      .single();

    if (error) throw error;
    return data as Reserva;
  }

  async actualizar(id: number, reserva: Partial<Reserva>): Promise<Reserva> {
    const { data, error } = await this.supabase
      .from('reservas')
      .update(reserva)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Reserva;
  }

  async eliminar(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('reservas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async existeSuperposicion(
    dia: string,
    horaInicio: string,
    horaFinal: string,
    excludeId?: number
  ): Promise<boolean> {
    let query = this.supabase
      .from('reservas')
      .select('id')
      .eq('dia', dia)
      .lt('hora_inicio', horaFinal)
      .gt('hora_final', horaInicio);

    if (excludeId !== undefined) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1);
    if (error) throw error;
    return (data ?? []).length > 0;
  }
}
