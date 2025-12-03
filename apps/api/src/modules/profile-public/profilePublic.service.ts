// apps/api/src/modules/profile-public/profilePublic.service.ts
import { withTx } from "../../config/database/database";
import { ProfilePublicSQL } from "./profilePublic.sql";

export type PublicProfileParams = {
  usuarioId: number;
  viewerId?: number | null;
  pubLimit?: number;
  pubOffset?: number;
  reviewLimit?: number;
  reviewOffset?: number;
};

export async function getPublicProfile(params: PublicProfileParams) {
  const {
    usuarioId,
    viewerId = null,
    pubLimit = 6,
    pubOffset = 0,
    reviewLimit = 5,
    reviewOffset = 0,
  } = params;

  return withTx(async (client) => {
    // PERFIL BÁSICO
    const perfilQ = await client.query(ProfilePublicSQL.publicProfile, [usuarioId]);
    if (!perfilQ.rowCount) {
      throw new Error("Usuario no encontrado");
    }
    const perfil = perfilQ.rows[0];

    // PUBLICACIONES PÚBLICAS
    const [pubsQ, pubsCountQ] = await Promise.all([
      client.query(ProfilePublicSQL.publicPublications, [
        usuarioId,
        pubLimit,
        pubOffset,
      ]),
      client.query(ProfilePublicSQL.publicPublicationsCount, [usuarioId]),
    ]);

    const publicaciones = pubsQ.rows;
    const pubsTotal = pubsCountQ.rows[0]?.total ?? 0;

    // RESEÑAS PÚBLICAS
    const [revQ, revCountQ] = await Promise.all([
      client.query(ProfilePublicSQL.userReviews, [
        usuarioId,
        reviewLimit,
        reviewOffset,
      ]),
      client.query(ProfilePublicSQL.userReviewsCount, [usuarioId]),
    ]);

    const reviews = revQ.rows;
    const reviewsTotal = revCountQ.rows[0]?.total ?? 0;

    // RESEÑA DEL VIEWER (SI ESTÁ LOGUEADO Y NO ES EL MISMO)
    let viewerReview = null;
    if (viewerId && viewerId !== usuarioId) {
      const vr = await client.query(ProfilePublicSQL.viewerReview, [
        usuarioId,
        viewerId,
      ]);
      viewerReview = vr.rows[0] ?? null;
    }

    return {
      perfil,
      publicaciones: {
        items: publicaciones,
        page: {
          total: pubsTotal,
          limit: pubLimit,
          offset: pubOffset,
          has_more: pubOffset + pubLimit < pubsTotal,
        },
      },
      reviews: {
        items: reviews,
        page: {
          total: reviewsTotal,
          limit: reviewLimit,
          offset: reviewOffset,
          has_more: reviewOffset + reviewLimit < reviewsTotal,
        },
      },
      viewerReview,
    };
  });
}

export type UpsertReviewInput = {
  autorId: number;
  destinatarioId: number;
  calificacion: number;
  comentario?: string | null;
};

export async function upsertReview(input: UpsertReviewInput) {
  const { autorId, destinatarioId, calificacion, comentario = null } = input;

  if (!calificacion || calificacion < 1 || calificacion > 5) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }

  if (autorId === destinatarioId) {
    throw new Error("No puedes reseñarte a ti mismo");
  }

  return withTx(async (client) => {
    // OPCIONAL: validar que haya intercambio completado
    const trade = await client.query(ProfilePublicSQL.checkCompletedTrade, [
      autorId,
      destinatarioId,
    ]);

    if (!trade.rowCount) {
      throw new Error(
        "Solo puedes reseñar usuarios con los que hayas completado un intercambio"
      );
    }

    const r = await client.query(ProfilePublicSQL.upsertReview, [
      calificacion,
      comentario,
      autorId,
      destinatarioId,
    ]);

    const review = r.rows[0];

    return { review };
  });
}
