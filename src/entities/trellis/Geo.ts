import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, JoinTable, ManyToMany} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from '../../services/JSONUtil'
import GeoType from './GeoType'
import Translation from './Translation'
import Photo from './Photo'

@Entity()
export default class Geo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  geoTypeId: string
  @Column() @Serializable
  parentId: string
  @Column({ type: 'double', nullable: true }) @Serializable
  latitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  longitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  altitude: number
  @Column() @Serializable
  nameTranslationId: string

  @OneToOne(type => GeoType, { eager: true })
  @JoinColumn({ name: 'geo_type_id' })
  geoType: GeoType

  @OneToOne(type => Translation, { eager: true })
  @JoinColumn({ name: 'name_translation_id' })
  nameTranslation: Translation

  @ManyToMany(type => Photo, photo => photo.geos, { eager: true })
  @JoinTable({ name: 'geo_photo' })
  photos: Photo[]

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      geoType: GeoType,
      nameTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
 }
}
